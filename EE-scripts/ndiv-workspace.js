/*///////////////////////////////////////////////////////////////////////////////////////
   This script was created by SkyTruth to identify possible active mountaintop removal
   and other surface coal mining.
///////////////////////////////////////////////////////////////////////////////////////*/
/*------------------------------------ Set NDVI Thresholds ----------------------------*/
/* Sets a threshold value that may be applied to the NDVI layers to seperate the values
  into two classes: '1' where possible mining is <= threshold, and '0' where vegetation
  is > threshold.  */
var NDVI_Threshold = 0.51;
var campagna_study_area = ee.FeatureCollection('ft:1Qo6AmhdEN44vPUpyGtzPtQUUO4rygWv4MljZ-MiE');
// Get the link here: https://www.google.com/fusiontables/DataSource?docid=1Qo6AmhdEN44vPUpyGtzPtQUUO4rygWv4MljZ-MiE
/*------------------------------------- Create Mask -------------------------------------
Imports 60 meter mask/creates variable containing imported mask */
var mask_input_60m = ee.Image('users/christian/60m-mask-total-area');
    // Takes an empty image and applies a 1 to everything outside of the
    // masked area (inverts mask_input) ie. New image returns everything
    // that isn't a road, river, etc.
var blank_mask = ee.Image(0);
var mask_inverted_60m = blank_mask.where(mask_input_60m.lte(0),1);
/*------------------------------ Import Greenest Pixel Composite --------------------------
Imports greenest pixel composites for Landsat imagery (L5, L7, & L8). */
var L8_composite = ee.Image(ee.ImageCollection('LANDSAT/LC8_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2015-01-01', '2015-12-31')
  .mean()
  .toFloat());
var L7_composite = ee.Image(ee.ImageCollection('LANDSAT/LE7_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2012-01-01', '2012-12-31')
  .first());
var L5_composite = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2011-01-01', '2011-12-31')
  .first());
/* -------------------------- Calculate NDVI ----------------------------------------------
              NORMALIZED DIFFERENCE VEGETATION INDEX
        Formula: NDVI =   (NIR - RED)
                        --------------
                          (NIR + RED)
NDVI is measured on scale of -1 to 1, though values below 0 are uncommon; the
scale used here is from 0 to 1. Lower values correspond to less dense vegetation
and are more likely to be bare ground.
------------------------------------------------------------------------------------------*/
var ndvi_2015 = L8_composite.expression(
  '(Band5 - Band4) / (Band5 + Band4)',
  {
    Band5: L8_composite.select('B5'),
    Band4: L8_composite.select('B4')
  }
  );
var ndvi_2012 = L7_composite.expression(
  '(Band4 - Band3) / (Band4 + Band3)',
  {
    Band4: L7_composite.select('B4'),
    Band3: L7_composite.select('B3')
  }
  );
var ndvi_2011 = L5_composite.expression(
  '(Band4 - Band3) / (Band4 + Band3)',
  {
    Band4: L5_composite.select('B4'),
    Band3: L5_composite.select('B3')
  }
  );
/* ----------------------------------------- Mask ---------------------------------------------------
Take an empty image and applies a 1 to where the NDVI values fall below the previously set threshold. */
var blank = ee.Image(0);
var LowNDVI_L8_2015 = blank.where(ndvi_2015.lte(NDVI_Threshold),1);
var LowNDVI_L7_2012 = blank.where(ndvi_2012.lte(NDVI_Threshold),1);
var LowNDVI_L5_2011 = blank.where(ndvi_2011.lte(NDVI_Threshold),1);
//-------------------------- VISUALIZE IN MAP DISPLAY --------------------------------------------
/* Creates styles which can be applied by the Map.addLayer function for the purpose of
   visualizing map layers inside this API.*/
var sld_intervals1 = '\
<RasterSymbolizer>\
  <ColorMap  type="intervals" extended="false" >\
    <ColorMapEntry color="#ff0000" quantity="0" label="lte 0" opacity="0"/>\
    <ColorMapEntry color="#ff0000" quantity="0.5" label="0.5" />\
    <ColorMapEntry color="#ff0000" quantity="1" label="1" />\
  </ColorMap>\
</RasterSymbolizer>'; //RED
var sld_intervals2 = '\
<RasterSymbolizer>\
  <ColorMap  type="intervals" extended="false" >\
    <ColorMapEntry color="#ff8700" quantity="0" label="lte 0" opacity="0"/>\
    <ColorMapEntry color="#ff8700" quantity="0.5" label="0.5" />\
    <ColorMapEntry color="#ff8700" quantity="1" label="1" />\
  </ColorMap>\
</RasterSymbolizer>'; //YELLOW
var sld_intervals3 = '\
<RasterSymbolizer>\
  <ColorMap  type="intervals" extended="false" >\
    <ColorMapEntry color="#00fff9" quantity="0" label="lte 0" opacity="0"/>\
    <ColorMapEntry color="#00fff9" quantity="0.5" label="0.5" />\
    <ColorMapEntry color="#00fff9" quantity="1" label="1" />\
  </ColorMap>\
</RasterSymbolizer>'; //BLUE
var sld_intervals4 = '\
<RasterSymbolizer>\
  <ColorMap  type="intervals" extended="false" >\
    <ColorMapEntry color="#00d600" quantity="0" label="lte 0" opacity="0"/>\
    <ColorMapEntry color="#00d600" quantity="0.5" label="0.5" />\
    <ColorMapEntry color="#00d600" quantity="1" label="1" />\
  </ColorMap>\
</RasterSymbolizer>'; //GREEN
// Create binary image containing the intersection between the LowVI and anything
// where the inverted mask is 1.
var MTR_1 = LowNDVI_L8_2015.and(mask_inverted_60m);
var MTR_2 = LowNDVI_L7_2012.and(mask_inverted_60m);
var MTR_3 = LowNDVI_L5_2011.and(mask_inverted_60m);
// MTR layers clipped to the extent of the Campagna Study Area
var MTR_1_clipped = MTR_1.clip(campagna_study_area);
var MTR_2_clipped = MTR_2.clip(campagna_study_area);
var MTR_3_clipped = MTR_3.clip(campagna_study_area);

//Centers map and sets zoom for this API display
Map.setCenter(-81.58,37.92,12);
Map.addLayer(campagna_study_area);
Map.addLayer(MTR_1.clip(campagna_study_area).sldStyle(sld_intervals1), {min:0, max:1}, 'MTR 2015');
Map.addLayer(MTR_2.clip(campagna_study_area).sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2012');
Map.addLayer(MTR_3.clip(campagna_study_area).sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 2011');
/*-------------------------- EXPORTING RESULTS --------------------------------------------
Cuts AOI into quadrants for faster export time
Creates variables that contain geometry for AOIs*/
                                      //[   lower right,     upper left   ]
var geometryI   = ee.Geometry.Rectangle([-79.849, 37.3525, -82.421, 38.942]);
var geometryII  = ee.Geometry.Rectangle([-82.421, 37.3525, -84.993, 38.942]);
var geometryIII = ee.Geometry.Rectangle([-82.421, 35.763,  -84.993, 37.3525]);
var geometryIV  = ee.Geometry.Rectangle([-79.849, 35.763,  -82.421, 37.3525]);
/* Creates variables that contain the geometries in geoJson format
   when exporting, region must be specified in geoJson format*/
var jsonCoordI   = geometryI.toGeoJSON();
var jsonCoordII  = geometryII.toGeoJSON();
var jsonCoordIII = geometryIII.toGeoJSON();
var jsonCoordIV  = geometryIV.toGeoJSON();
/* Creates variables containing CRS, CRS_TRANSFORM, and SCALE/RESOLUTION from IMAGE and
   MASK which is used by Export.image function. */
var lsat5_crs = L5_composite.projection().atScale(30).getInfo()['crs'];
var lsat5_crs_transform = L5_composite.projection().atScale(30).getInfo()['transform'];
var lsat7_crs = L7_composite.projection().atScale(30).getInfo()['crs'];
var lsat7_crs_transform = L7_composite.projection().atScale(30).getInfo()['transform'];
var lsat8_crs = L8_composite.projection().atScale(30).getInfo()['crs'];
var lsat8_crs_transform = L8_composite.projection().atScale(30).getInfo()['transform'];
  //.atScale() -- pixel size of image ie. for landsat .atScale(30) because landsat pixels are 30m,
  //.getinfo() extracts the data; .getInfo()['crs'] extracts the crs data from the composite
var mask60m_crs = mask_input_60m.projection().atScale(30).getInfo()['crs'];
var mask60m_crs_transform = mask_input_60m.projection().atScale(30).getInfo()['transform'];

// For image exports, see 5-23_MTR_Script

//------------------------------------ Work in Progress ------------------------------------
// Code below this point is still being tested, run at your own risk...

// ------------------- Reclaimed Mine Classification: *** THIS WORKS *** -------------------
//      Early Date - Later Date
// Areas which are classified as mine land in earlier image but not later image, are now
// classified as reclaimed mine land.
//var reclaimed = MTR_2.subtract(MTR_1);
//Map.addLayer(reclaimed.sldStyle(sld_intervals4), {min:0, max:1}, 'reclaim');


// ------------------------- EROSION & DILATION: *** THIS WORKS *** ------------------------

// ERODE/DILATE MTR Sites to remove outliers
//___1___
var blank_mask = ee.Image(0);
//___2___
Map.addLayer(MTR_1_clipped.sldStyle(sld_intervals1), {min:0, max:1}, 'MTR 2015 Clipped');
// EROSION
//___3a___
var MTR_invert = blank_mask.where(MTR_1_clipped.eq(0),1).where(MTR_1_clipped.eq(1),0);
//Map.addLayer(MTR_invert, {min:0, max:1}, 'MTR 2015 Invert');
//___4a___
var MTR_invert_buffer = MTR_invert.distance(ee.Kernel.euclidean(30,'meters')).where(MTR_invert.eq(0),1).where(MTR_invert.eq(1),0);
//Map.addLayer(MTR_invert_buffer, {min:0, max:1}, 'MTR 2015 Invert Buffer');
//___5a___
var MTR_in30 = MTR_1_clipped.subtract(MTR_invert_buffer);
//Map.addLayer(MTR_in30, {min:0, max:1}, 'in 30');
//___6a___
var final_invert = blank_mask.where(MTR_in30.eq(0),0).where(MTR_in30.gte(0),1);
var MTR_buffered_in = blank_mask.where(final_invert.eq(0),1).where(final_invert.eq(1),0);
Map.addLayer(MTR_buffered_in.clip(campagna_study_area).sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2015 Eroded');
// DILATION
//___3b___
var buffer_out = MTR_buffered_in.distance(ee.Kernel.euclidean(30,'meters'));
//Map.addLayer(buffer_out, {min:0, max:1}, 'MTR buffering_out');
var buffer_out_2 = buffer_out.where(MTR_in30.eq(0),0).where(MTR_in30.gte(0),1);
//Map.addLayer(buffer_out_2, {min:0, max:1}, 'MTR buffering_out 2');
var final_buffer_out = MTR_buffered_in.clip(campagna_study_area).add(buffer_out_2);
Map.addLayer(final_buffer_out.sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 2015 Dilated');
//Export.image(final_buffer_out, '2015_MTR_Dilated_Scene-1', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordI});
//Export.image(final_buffer_out, '2015_MTR_Dilated_Scene-2', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordII});
//Export.image(final_buffer_out, '2015_MTR_Dilated_Scene-3', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIII});
//Export.image(final_buffer_out, '2015_MTR_Dilated_Scene-4', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIV});
//Export.image(MTR_1_clipped, '2015_MTR_clipped_Scene-1', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordI});
//Export.image(MTR_1_clipped, '2015_MTR_clipped_Scene-2', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordII});
//Export.image(MTR_1_clipped, '2015_MTR_clipped_Scene-3', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIII});
//Export.image(MTR_1_clipped, '2015_MTR_clipped_Scene-4', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIV});
//------------------------------------------------------------------------------------------------------------------------------------------------------


// ------------------------- AREA CALCULATION: *** IN PROGRESS *** ------------------------

var Area = ee.Image.pixelArea();
function get_area(layerName, theLayer){
  var areaAll = theLayer.multiply(Area).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometryIII,
    scale: 30,
    crs: 'EPSG:3857',
    maxPixels: 1e9
  });
  var areaKmSq = ee.Number(areaAll.get('constant')).divide(1000*1000);
  print(layerName,areaKmSq);
  return areaKmSq;
}
get_area("2015 MTR Site Area in Km Sq: ", final_buffer_out);

/*
// Kroodsma Area Calculation Work:
// Get a pixel area image, which will apply to any scale you provide
var pixelArea = ee.Image.pixelArea();

// Function to reduce region to get statistics of area
function get_area(layerName, theLayer){
  var areaIAll = theLayer.multiply(pixelArea).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometryI, //campagna_study_area
    scale: 30,
    maxPixels: 1e9
   });
   var areaSqKm = ee.Number(areaIAll.get('constant')).divide(1000*1000);
  print(layerName, areaSqKm);
  return areaSqKm;
}
get_area("2015_MTR_Dilated_Scene-1 Area in Sq Km: ", final_buffer_out);

// Get a pixel area image, which will apply to any scale you provide
var pixelArea1 = ee.Image.pixelArea();

function get_area1(layerName, theLayer){
  var areaIAll = theLayer.multiply(pixelArea1).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometryII,
    scale: 30,
    maxPixels: 1e9
   });
   var areaSqKm = ee.Number(areaIAll.get('constant')).divide(1000*1000);
  print(layerName, areaSqKm);
  return areaSqKm;
}
get_area1("MTR_1 Area2 in Sq Km: ", final_buffer_out);
*/
//---------------------------------------------------------------------------------------------------

// ------------------------- VECTORIZATION OF MTR SITES: *** IN PROGRESS *** ------------------------

var vector_MTR = MTR_1_clipped.reduceToVectors({
  geometry: campagna_study_area,
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
//---------------------------------------------------------------------------------------------------

// UPDATES
// - 5/25: Clip output to Campagna Study Area
// - 5/25: Area calculation slipped to Campagna Study Area
// - 5/25: Export.image() is depricated, changed to Export.image.toDrive()
// - 5/26: Erosion/Dilation of MTR sites is now possible to remove artifact pixels
// - 5/31: Export polygonized MTR sites
// - 6/02: Script Cleanup to simpify for work currently In-Progress
