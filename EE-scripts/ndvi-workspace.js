/*///////////////////////////////////////////////////////////////////////////////////////
   This script was created by SkyTruth to identify possible active mountaintop removal 
   and other surface coal mining.
   
   Playground code: https://code.earthengine.google.com/56385c427255ab3848b6ae0c27a0c8fa
///////////////////////////////////////////////////////////////////////////////////////*/

/*------------------------------------ IMPORT STUDY AREA ----------------------------*/
var studyArea = ee.FeatureCollection('ft:1Lphn5PR9YbneoY4sPkKGMUOJcurihIcCx0J82h7U');
// Get the link here: https://www.google.com/fusiontables/DataSource?docid=1Lphn5PR9YbneoY4sPkKGMUOJcurihIcCx0J82h7U

/*------------------------------------ SET NDVI THRESHOLD ---------------------------*/
var NDVI_Threshold = 0.51; // In future versions, this will be specific per year

/*------------------------------------- IMPORT MASK ---------------------------------*/
var mask_input_60m = ee.Image('users/jerrilyn/2015mask-PM');
// Get the link here: https://drive.google.com/file/d/0B_MArPTqurHudTNEaUptMkpoTzA/view

/* ----------------------------------- VISUALIZATION / SETUP ------------------------------
Adds study area; various areas of interest  */

Map.addLayer(studyArea, {}, "Study area");

// Choose your favorite area of interest! Comment out all but one:
//Map.centerObject(studyArea);        // Full study extent
Map.setCenter(-81.971744, 38.094253, 12);     // Near Spurlockville, WV
//Map.setCenter(-82.705444, 37.020257, 12);     // Near Addington, VA
//Map.setCenter(-83.224567, 37.355144, 11);     // Near Dice, KY
//Map.setCenter(-83.931184, 36.533646, 12);     // Near Log Mountain, TN

// This list will contain all output images, so as to build an ImageCollection later for video export
var allMTR_list = [];

// This empty 2D array will be used for area calculation later (if performed)
var MTR_area = [[],[]];

// Subregions for exporting images/videos
var geometryI   = ee.Geometry.Rectangle([-79.849, 37.3525, -82.421, 38.942]).toGeoJSON();
var geometryII  = ee.Geometry.Rectangle([-82.421, 37.3525, -84.993, 38.942]).toGeoJSON();
var geometryIII = ee.Geometry.Rectangle([-82.421, 35.763,  -84.993, 37.3525]).toGeoJSON();
var geometryIV  = ee.Geometry.Rectangle([-79.849, 35.763,  -82.421, 37.3525]).toGeoJSON();
var exportbounds =studyArea.geometry().bounds().getInfo();

/*--------------------------------- IMAGE PROCESSING ---------------------------------*/

// This function will clean input, raw Landsat data for errors / edge contamination
// Function modified from Matt Hancher, https://code.earthengine.google.com/8c36dfab4f496b230cd7109f959089ff
var cleaner = function(image){
    // Compute the minimum mask across all bands, to eliminate known-risky edge pixels.
    var min_mask = image.mask().reduce(ee.Reducer.min()).gt(0);
    // Compute a mask that eliminates fully-saturated (likey non-physical) sensor values.
    var sat_mask = image.reduce(ee.Reducer.max()).lt(250);
    // Combine these masks and erode neighboring pixels just a bit.
    var new_mask = min_mask.min(sat_mask).focal_min(3);
    // Turn raw images into TOA images.
    return ee.Algorithms.Landsat.TOA(image).updateMask(new_mask);
};

for (var year = 2015; year >= 1984; year--){ // Years of interest for the study
  
  // Determine what imagery dataset to use, based off year loop
  if (year <= 2011){
    var imagery = ee.ImageCollection("LANDSAT/LT5_L1T");
    var NDVIbands = 43;
    var rgb_vis = {min:0, max:0.3, bands:['B3','B2','B1']};
  }
  else if (year == 2012){
    var imagery = ee.ImageCollection("LANDSAT/LE7_L1T");
    var NDVIbands = 43;
    var rgb_vis = {min:0, max:0.25, bands:['B3','B2','B1']};
  }
  else if (year >= 2013){
    var imagery = ee.ImageCollection("LANDSAT/LC8_L1T");
    var NDVIbands = 54; // Because different bands are needed for LS8
    var rgb_vis = {min:0, max:0.25, bands:['B4','B3','B2']};
  }
  
  // Select specific year for analysis and clean raw input data
  var yearImgs = imagery
    .filterDate(year+"-01-01", year+"-12-31")
    .filterBounds(studyArea)
    .map(cleaner);
  
  // Calculate NDVI and create greenest pixel composite 
  // (using normalizedDifference function; select correct bands per sensor)
  if (NDVIbands == 54){
    var ndCalc = yearImgs.map(function(image){
      var calc = image.normalizedDifference(["B5","B4"]).clip(studyArea);
      return image.addBands(calc);
    });
    var NDVI = ndCalc.qualityMosaic("nd");
  }
  else {
    var ndCalc = yearImgs.map(function(image){
      var calc = image.normalizedDifference(["B4","B3"]).clip(studyArea).select("nd");
      return image.addBands(calc);
    });
    var NDVI = ndCalc.qualityMosaic("nd");
  }
  
  // Create a mask of areas that ARE NOT mines (value of 1 to locations where NDVI is <= threshold)
  var lowNDVI = NDVI.where(NDVI.lte(NDVI_Threshold),1).where(NDVI.gt(NDVI_Threshold),0);
  
  // Create binary image containing the intersection between the LowNDVI and anywhere the inverted mask is 1
  var MTR = lowNDVI.and(mask_input_60m.eq(0));
  
  // Erode/dilate MTR sites to remove outliers (pixel clean-up)
  var MTR_eroded_dialated_dialated_eroded = MTR
    .reduceNeighborhood(ee.Reducer.max(), ee.Kernel.euclidean(30, 'meters'))
    .reduceNeighborhood(ee.Reducer.min(), ee.Kernel.euclidean(30, 'meters'))
    .reduceNeighborhood(ee.Reducer.min(), ee.Kernel.euclidean(30, 'meters'))
    .reduceNeighborhood(ee.Reducer.max(), ee.Kernel.euclidean(30, 'meters'));
  
  var MTR_masked = MTR_eroded_dialated_dialated_eroded.updateMask(MTR_eroded_dialated_dialated_eroded);

  /*--------------------------------- IMAGE VISUALIZATION ---------------------------------*/
  
  // Set color palette by year (http://colorbrewer2.org/?type=sequential&scheme=OrRd&n=6)
  // Currently every five years are a different color (dark -> light over time)
  if (year <= 1988){
    var palette = "b30000";
  }
  else if (year > 1988 && year <= 1993 ){
    var palette = "e34a33";
  }
  else if (year > 1993 && year <= 1998){
    var palette = "fc8d59";
  }
  else if (year > 1998 && year <= 2003){
    var palette = "fdbb84";
  }
  else if (year > 2003 && year <= 2008){
    var palette = "fdd49e";
  }
  else if (year > 2008){
    var palette = "fef0d9";
  }
  
  // Add each layer to the map; 
  // only years divisible by 5 turned on by default because this takes a while to display
  if (year % 5 === 0){
    Map.addLayer(MTR_masked, {palette: palette}, ("MTR "+ year), true);
  }
  else {
    Map.addLayer(MTR_masked, {palette: palette}, ("MTR "+ year), false);
  }
  
  /*--------------------------------- AREA CALCULATION ---------------------------------
  
  // Get a pixel area image, which will apply to any scale you provide
  var Area = ee.Image.pixelArea();
  // The area calculation, which currently burns out the server
  var areaAll = MTR_masked.multiply(Area).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometryI,
    scale: 30,
    crs: 'EPSG:3857', // Kroodsma did not include this option
    maxPixels: 1e9
  });
  var areaKmSq = ee.Number(areaAll.get('constant')).divide(1000*1000);
  
  // Add these areas and their corresponding year to 2D array
  MTR_area[0].push(year);
  MTR_area[1].push(areaKmSq);
  */
  
  /* -------------------------------- EXPORTING ------------------------------------------- 
  Comment out this section if you don't want to export anything */
  
  // Set CRS and transform; create rectangular boundaries for exporting
  //var crs = yearImg.projection().atScale(30).getInfo()['crs'];
  //var transform = yearImg.projection().atScale(30).getInfo()['transform'];

  /*// Export entire study region to GDrive (many images; one per year!)
  Export.image.toDrive({
      image: MTR_masked.unmask(0),
      description: "MTR_"+year,
      region: exportbounds,
      scale: 900,
      //crs: crs,
      //crsTransform: transform
    });
  // OR, export one or some of the subregions to GDrive (many images!) 
  Export.image.toDrive({
      image: MTR_masked.unmask(0),
      description: "MTR"+year+"reg1",
      region: geometryI,
      scale: 90,
      //crs: crs,
      //crsTransform: transform
    });
  Export.image.toDrive({
      image: MTR_masked.unmask(0),
      description: "MTR"+year+"reg2",
      region: geometryII,
      scale: 90,
      crs: crs,
      crsTransform: transform
    });
  Export.image.toDrive({
      image: MTR_masked.unmask(0),
      description: "MTR"+year+"reg3",
      region: geometryIII,
      scale: 90,
      crs: crs,
      crsTransform: transform
    });
      
  Export.image.toDrive({
      image: MTR_masked.unmask(0),
      description: "MTR"+year+"reg4",
      region: geometryIV,
      scale: 90,
      crs: crs,
      crsTransform: transform
    });
    */  
    
  // Add each layer to a list, so as to build an ImageCollection for Video
  allMTR_list.push(MTR_masked);
}

/* ------------------------- VIDEO OUTPUT ---------------------------------------------
// Create an ImageCollection of all images and use that to export a video
var reversedList = allMTR_list.reverse();
var allMTR = ee.ImageCollection(reversedList).map(function(image){
  return image.visualize({
    forceRgbOutput: true,
    palette: ["000000", "fdbb84"],
    min: 0,
    max: 1
  });
});
var HobetBounds = ee.Geometry.Rectangle([-82.015, 38.0413, -81.8447, 38.137]);
Export.video.toDrive({
  collection: allMTR,
  description: "MTRtimelapse",    // Filename, no spaces allowed
  framesPerSecond: 1,             // I.e., 1 year / second
  region: HobetBounds,
  scale: 60,                     // Scale in m
  });
//*/




//------------------------------------ Work in Progress ------------------------------------
// Code below this point is still being tested, run at your own risk...
// This is all copied from old code, so variable references are likely broken 

/* ------------------- Total Reclaimed Mine Classification: -------------------
 Areas which are classified as mine land in earlier image but not later image, are now
 classified as reclaimed mine land.
      Early Date - Later Date 
//var reclaimed = MTR_1984.subtract(MTR_2014);
//Map.addLayer(reclaimed.sldStyle(sld_intervals5), {min:0, max:1}, 'Reclaimed Mine Land');
//---------------------------------------------------------------------------------------------------
// ------------------------- VECTORIZATION OF MTR SITES: *** IN PROGRESS *** ------------------------
var vector_MTR = MTR_1_clipped.reduceToVectors({
  geometry: studyArea,
  geometryType: 'polygon',
  crs: lsat8_crs,
  crsTransform: lsat8_crs_transform,
  eightConnected: false,
  maxPixels: 1e9,
  labelProperty: '1',
});
//Map.addLayer(vector_MTR);
//Export.image(final_buffer_out, '2015_MTR_Dilated_Scene-1', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordI});
//Export.table(vector_MTR,'vector_MTR1_minmax',{crs: lsat8_crs, crs_transform: lsat8_crs_transform, min:0, max:1});
      // ^^^ Needs to be exported as GeoJson, include min/max values
*/

//---------------------------------------------------------------------------------------------------
// UPDATES
// - 5/25: Clip output to Campagna Study Area
// - 5/25: Area calculation slipped to Campagna Study Area
// - 5/25: Export.image() is depricated, changed to Export.image.toDrive()
// - 5/26: Erosion/Dilation of MTR sites is now possible to remove artifact pixels
// - 5/31: Export polygonized MTR sites
// - 6/02: Script Cleanup to simpify for work currently In-Progress
// - 6/06: Script Cleanup for overall simplification
// - 6/24: Lots of cleaning/optimization
// - 7/07: Add new mask/study area; code for own greenest pixel composite
