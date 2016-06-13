/*///////////////////////////////////////////////////////////////////////////////////////
   This script was created by SkyTruth to identify possible active mountaintop removal 
   and other surface coal mining.
///////////////////////////////////////////////////////////////////////////////////////*/
var campagna_study_area = ee.FeatureCollection('ft:1Qo6AmhdEN44vPUpyGtzPtQUUO4rygWv4MljZ-MiE');
// Get the link here: https://www.google.com/fusiontables/DataSource?docid=1Qo6AmhdEN44vPUpyGtzPtQUUO4rygWv4MljZ-MiE
/*------------------------------------ SET NDVI THRESHOLD ----------------------------*/
var NDVI_Threshold = 0.51;
/*------------------------------------- IMPORT MASK -------------------------------------
Imports 60 meter mask/creates variable containing imported mask */
var mask_input_60m = ee.Image('users/christian/60m-mask-total-area');
//'https://drive.google.com/file/d/0ByjSOOGMRVf5aUpLa01aX0FXR0U/view?usp=sharing'
var blank_mask = ee.Image(0);
var mask_inverted_60m = blank_mask.where(mask_input_60m.lte(0),1);

/* ----------------------------------- VISUALIZATION ------------------------------------
Adds Campagna study area; various areas of interest  */

Map.addLayer(campagna_study_area, {}, "Study area");

// Choose your favorite area of interest! Comment out all but one:
//Map.centerObject(campagna_study_area);        // Full study extent
//Map.setCenter(-81.971744, 38.094253, 12);     // Near Spurlockville, WV
Map.setCenter(-82.705444, 37.020257, 12);     // Near Addington, VA
//Map.setCenter(-83.224567, 37.355144, 11);     // Near Dice, KY
//Map.setCenter(-83.931184, 36.533646, 12);     // Near Log Mountain, TN

// This list will contain all output images, so as to build an ImageCollection later
var allMTR_list = [];

// Subregions for exporting images/videos
var geometryI   = ee.Geometry.Rectangle([-79.849, 37.3525, -82.421, 38.942]).toGeoJSON();
var geometryII  = ee.Geometry.Rectangle([-82.421, 37.3525, -84.993, 38.942]).toGeoJSON();
var geometryIII = ee.Geometry.Rectangle([-82.421, 35.763,  -84.993, 37.3525]).toGeoJSON();
var geometryIV  = ee.Geometry.Rectangle([-79.849, 35.763,  -82.421, 37.3525]).toGeoJSON();
var exportbounds = campagna_study_area.geometry().bounds().getInfo();

/*--------------------------------- IMAGE PROCESSING ---------------------------------*/
for (var year = 1984; year <= 2015; year++){ // Years of interest for the study
  
  // Determine what imagery dataset to use, based off year loop; and what threshold to use
  if (year <= 2011){
    var imagery = ee.ImageCollection("LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA");
    //var NDVI_Threshold = 0.57635; // Per ROC analysis
  }
  else if (year == 2012){
    var imagery = ee.ImageCollection("LANDSAT/LE7_L1T_ANNUAL_GREENEST_TOA");
    //var NDVI_Threshold = 0.6156; // Per ROC analysis
  }
  else if (year >= 2013){
    var imagery = ee.ImageCollection("LANDSAT/LC8_L1T_ANNUAL_GREENEST_TOA");
    //var NDVI_Threshold = 0.5665; // Per ROC analysis
    var NDVIbands = 54; // Because different bands are needed for LS8
  }
  
  // Select specific year for analysis
  var yearImg = ee.Image(imagery
    .filterDate(year+"-01-01", year+"-12-31")
    .first());
  
  // Calculate NDVI (using normalizedDifference function; select correct bands per sensor)
  if (NDVIbands == 54){
    var NDVI = yearImg.normalizedDifference(["B5","B4"]);
  }
  else {
    var NDVI = yearImg.normalizedDifference(["B4","B3"]);
  }
  
  // Create a mask of areas that ARE NOT mines (value of 1 to locations where NDVI is <= threshold)
  var blank = ee.Image(0);
  var lowNDVI = blank.where(NDVI.lte(NDVI_Threshold),1);
  
  // Create binary image containing the intersection between the LowNDVI and anywhere the inverted mask is 1
  var MTR = lowNDVI.and(mask_inverted_60m);
  
  // Clip MTR to extent of the Campagna study area
  var MTR_clipped = MTR.clip(campagna_study_area);
  
  // Erode/dilate MTR sites to remove outliers (pixel clean-up)
  var blank = ee.Image(0);
  var MTR_invert = blank.where(MTR_clipped.eq(0),1).where(MTR_clipped.eq(1),0);
  var MTR_invert_buffer = MTR_invert.distance(ee.Kernel.euclidean(30,'meters')).where(MTR_invert.eq(0),1).where(MTR_invert.eq(1),0);
  var MTR_in30 = MTR_clipped.subtract(MTR_invert_buffer);
  var final_invert = blank.where(MTR_in30.eq(0),0).where(MTR_in30.gte(0),1);
  var MTR_buffered_in = blank.where(final_invert.eq(0),1).where(final_invert.eq(1),0);
  var buffer_out = MTR_buffered_in.distance(ee.Kernel.euclidean(30,'meters'));
  var buffer_out_2 = buffer_out.where(MTR_in30.eq(0),0).where(MTR_in30.gte(0),1);
  var final_buffer_out = MTR_buffered_in.clip(campagna_study_area).add(buffer_out_2);
  
  // Set color palette by year (http://colorbrewer2.org/?type=sequential&scheme=Reds&n=6)
  // Currently every five years are a different color (dark -> light over time)
  if (year <= 1988){
    var palette = "a50f15";
  }
  else if (year > 1988 && year <= 1993 ){
    var palette = "de2d26";
  }
  else if (year > 1993 && year <= 1998){
    var palette = "fb6a4a";
  }
  else if (year > 1998 && year <= 2003){
    var palette = "fc9272";
  }
  else if (year > 2003 && year <= 2008){
    var palette = "fcbba1";
  }
  else if (year > 2008){
    var palette = "fee5d9";
  }
  
  // Add each layer to the map; only years divisible by 5 turned on by default (warning, takes a while)
  if (year % 5 === 0){
    Map.addLayer(final_buffer_out, {palette: palette}, ("MTR "+ year), true);
  }
  else {
    Map.addLayer(final_buffer_out, {palette: palette}, ("MTR "+year), false);
  }
  
  /* -------------------------------- EXPORTING ------------------------------------------- 
  Comment out this section if you don't want to export anything*/
  
  // Set CRS and transform; create rectangular boundaries for exporting
  //var crs = yearImg.projection().atScale(30).getInfo()['crs'];
  //var transform = yearImg.projection().atScale(30).getInfo()['transform'];

  // Export entire study region to GDrive (many images; one per year!)
  Export.image.toDrive({
      image: final_buffer_out.unmask(0),
      description: "MTR"+year+"reg1",
      region: exportbounds,
      scale: 90,
      //crs: crs,
      //crsTransform: transform
    });

  /*// OR, export one or some of the subregions to GDrive (many images!) 
  Export.image.toDrive({
      image: final_buffer_out.unmask(0),
      description: "MTR"+year+"reg1",
      region: geometryI,
      scale: 90,
      //crs: crs,
      //crsTransform: transform
    });

  Export.image.toDrive({
      image: final_buffer_out.unmask(0),
      description: "MTR"+year+"reg2",
      region: geometryII,
      scale: 90,
      crs: crs,
      crsTransform: transform
    });

  Export.image.toDrive({
      image: final_buffer_out.unmask(0),
      description: "MTR"+year+"reg3",
      region: geometryIII,
      scale: 90,
      crs: crs,
      crsTransform: transform
    });
      
  Export.image.toDrive({
      image: final_buffer_out.unmask(0),
      description: "MTR"+year+"reg4",
      region: geometryIV,
      scale: 90,
      crs: crs,
      crsTransform: transform
    });
    */  
    
  // Add each layer to a list, so as to build an ImageCollection
  allMTR_list.push(final_buffer_out);
}



/* ------------------------- VIDEO OUTPUT ---------------------------------------------
Create an ImageCollection of all images, and use that to export a video 

var allMTR = ee.ImageCollection(allMTR_list).map(function(image){
  return image.addBands(image).addBands(image).uint8();
});

var exportbounds = campagna_study_area.geometry().bounds().getInfo();
var video = Export.video.toDrive({
  collection: allMTR, 
  description: "MTRtimelapse",    // Filename, no spaces allowed
  framesPerSecond: 1,             // I.e., 1 year / second
  dimensions: 720,
  region: exportbounds,
  scale: 1000,                    // 60 m/pixel when exported, to match early LS
  });
//*/



// DISPLAY UN-PROCESSED MTR SITES (no erode/dilate)
/*
Map.addLayer(MTR_2014.clip(campagna_study_area).sldStyle(sld_intervals1), {min:0, max:1}, 'MTR 2014');
Map.addLayer(MTR_2013.clip(campagna_study_area).sldStyle(sld_intervals1), {min:0, max:1}, 'MTR 2013');
Map.addLayer(MTR_2012.clip(campagna_study_area).sldStyle(sld_intervals1), {min:0, max:1}, 'MTR 2012');
Map.addLayer(MTR_2011.clip(campagna_study_area).sldStyle(sld_intervals1), {min:0, max:1}, 'MTR 2011');
Map.addLayer(MTR_2010.clip(campagna_study_area).sldStyle(sld_intervals1), {min:0, max:1}, 'MTR 2010');

Map.addLayer(MTR_2009.clip(campagna_study_area).sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2009');
Map.addLayer(MTR_2008.clip(campagna_study_area).sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2008');
Map.addLayer(MTR_2007.clip(campagna_study_area).sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2007');
Map.addLayer(MTR_2006.clip(campagna_study_area).sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2006');
Map.addLayer(MTR_2005.clip(campagna_study_area).sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2005');
Map.addLayer(MTR_2004.clip(campagna_study_area).sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2004');
Map.addLayer(MTR_2003.clip(campagna_study_area).sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2003');
Map.addLayer(MTR_2002.clip(campagna_study_area).sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2002');
Map.addLayer(MTR_2001.clip(campagna_study_area).sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2001');
Map.addLayer(MTR_2000.clip(campagna_study_area).sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2000');

Map.addLayer(MTR_1999.clip(campagna_study_area).sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1999');
Map.addLayer(MTR_1998.clip(campagna_study_area).sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1998');
Map.addLayer(MTR_1997.clip(campagna_study_area).sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1997');
Map.addLayer(MTR_1996.clip(campagna_study_area).sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1996');
Map.addLayer(MTR_1995.clip(campagna_study_area).sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1995');
Map.addLayer(MTR_1994.clip(campagna_study_area).sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1994');
Map.addLayer(MTR_1993.clip(campagna_study_area).sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1993');
Map.addLayer(MTR_1992.clip(campagna_study_area).sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1992');
Map.addLayer(MTR_1991.clip(campagna_study_area).sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1991');
Map.addLayer(MTR_1990.clip(campagna_study_area).sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1990');

Map.addLayer(MTR_1989.clip(campagna_study_area).sldStyle(sld_intervals4), {min:0, max:1}, 'MTR 1989');
Map.addLayer(MTR_1988.clip(campagna_study_area).sldStyle(sld_intervals4), {min:0, max:1}, 'MTR 1988');
Map.addLayer(MTR_1987.clip(campagna_study_area).sldStyle(sld_intervals4), {min:0, max:1}, 'MTR 1987');
Map.addLayer(MTR_1986.clip(campagna_study_area).sldStyle(sld_intervals4), {min:0, max:1}, 'MTR 1986');
Map.addLayer(MTR_1985.clip(campagna_study_area).sldStyle(sld_intervals4), {min:0, max:1}, 'MTR 1985');
Map.addLayer(MTR_1984.clip(campagna_study_area).sldStyle(sld_intervals4), {min:0, max:1}, 'MTR 1984');

/* ------------------- Total Reclaimed Mine Classification: -------------------
 Areas which are classified as mine land in earlier image but not later image, are now
 classified as reclaimed mine land.
      Early Date - Later Date 
//var reclaimed = MTR_1984.subtract(MTR_2014);
//Map.addLayer(reclaimed.sldStyle(sld_intervals5), {min:0, max:1}, 'Reclaimed Mine Land');


*/
