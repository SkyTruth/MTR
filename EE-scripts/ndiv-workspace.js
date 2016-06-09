var geometry = /* color: d63000 */ee.Geometry.MultiPoint(),
    geometry2 = /* color: 98ff00 */ee.Geometry.Polygon(
        [[[-82.41943359375, 38.17343267903539],
          [-82.430419921875, 37.4639585727641],
          [-81.3372802734375, 37.472678309670826],
          [-81.309814453125, 38.19502155795572]]]),
    geometry3 = /* color: 0B4A8B */ee.Geometry.Polygon(
        [[[-81.1614990234375, 37.34832607355296],
          [-81.134033203125, 38.30718056188316],
          [-82.5677490234375, 38.294247973205294],
          [-82.584228515625, 37.33522435930639]]]),
    campagna_study_area = ee.FeatureCollection("ft:1Qo6AmhdEN44vPUpyGtzPtQUUO4rygWv4MljZ-MiE");
/*/////////////////////////////////////////////////////////////////////////////////////////////////////
   This script was created by SkyTruth to identify possible active mountaintop removal and other
   surface coal mining.
/////////////////////////////////////////////////////////////////////////////////////////////////////*/
/*------------------------------------ Set NDVI Thresholds -----------------------------------------------*/

/* Sets a threshold value that may be applied to the NDVI layers to seperate the values into
   two classes: '1' where possible mining is <= threshold, and '0' where vegetation is > threshold.  */
var NDVI_Threshold = 0.51;
/*------------------------------------- Create Mask ---------------------------------------------------
Imports 60 meter mask/creates variable containing imported mask */
var mask_input_60m = ee.Image('users/christian/60m-mask-total-area');
      // Takes an empty image and applies a 1 to everything outside
      // of the masked area (inverts mask_input) ie. New image returns
      // everything that isn't a road, river, etc.
var blank_mask = ee.Image(0);
var mask_inverted_60m = blank_mask.where(mask_input_60m.lte(0),1);
/*--------------------------------- Create Greenest Pixel Composite -----------------------------------
Imports a greenest pixel composite for Landsat imagery (L5 & L8). */
var L8_composite = ee.Image(ee.ImageCollection('LANDSAT/LC8_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2015-01-01', '2015-12-31')
  .mean()
  .toFloat());
var L8_composite1 = ee.Image(ee.ImageCollection('LANDSAT/LC8_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2014-01-01', '2014-12-31')
  .mean()
  .toFloat());
var L8_composite2 = ee.Image(ee.ImageCollection('LANDSAT/LC8_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2013-01-01', '2013-12-31')
  .mean()
  .toFloat());
var L7_composite = ee.Image(ee.ImageCollection('LANDSAT/LE7_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2012-01-01', '2012-12-31')
  .first());
var L5_composite = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2011-01-01', '2011-12-31')
  .first());
var L5_composite1 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2010-01-01', '2010-12-31')
  .first());
var L5_composite2 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2008-01-01', '2008-12-31')
  .first());
var L5_composite3 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1995-01-01', '1995-12-31')
  .first());
var L5_composite4 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1994-01-01', '1994-12-31')
  .first());
var L5_composite5 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1993-01-01', '1993-12-31')
  .first());
var L5_composite6 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1985-01-01', '1985-12-31')
  .first());
var L5_composite7 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1984-01-01', '1984-12-31')
  .first());
var L5_composite8 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1986-01-01', '1986-12-31')
  .first());
/* -------------------------- Calculate NDVI -------------------------------
NORMALIZED DIFFERENCE VEGETATION INDEX
Formula: NDVI =   (NIR - RED)
                 --------------
                  (NIR + RED)

NDVI is measured on scale of -1 to 1, though values below 0 are uncommon;
the scale used here is from 0 to 1. Lower values correspond to less dense
vegetation and are more likely to be bare ground.
---------------------------------------------------------------------------- */
var ndvi_2015 = L8_composite.expression(
  '(Band5 - Band4) / (Band5 + Band4)',
  {
    Band5: L8_composite.select('B5'),
    Band4: L8_composite.select('B4')
  }
  );
var ndvi_2014 = L8_composite1.expression(
  '(Band5 - Band4) / (Band5 + Band4)',
  {
    Band5: L8_composite1.select('B5'),
    Band4: L8_composite1.select('B4')
  }
  );
var ndvi_2013 = L8_composite2.expression(
  '(Band5 - Band4) / (Band5 + Band4)',
  {
    Band5: L8_composite2.select('B5'),
    Band4: L8_composite2.select('B4')
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
var ndvi_2010 = L5_composite1.expression(
  '(Band4 - Band3) / (Band4 + Band3)',
  {
    Band4: L5_composite1.select('B4'),
    Band3: L5_composite1.select('B3')
  }
  );
var ndvi_2008 = L5_composite2.expression(
  '(Band4 - Band3) / (Band4 + Band3)',
  {
    Band4: L5_composite2.select('B4'),
    Band3: L5_composite2.select('B3')
  }
  );
var ndvi_1995 = L5_composite3.expression(
  '(Band4 - Band3) / (Band4 + Band3)',
  {
    Band4: L5_composite3.select('B4'),
    Band3: L5_composite3.select('B3')
  }
  );
var ndvi_1994 = L5_composite4.expression(
  '(Band4 - Band3) / (Band4 + Band3)',
  {
    Band4: L5_composite4.select('B4'),
    Band3: L5_composite4.select('B3')
  }
  );
var ndvi_1993 = L5_composite5.expression(
  '(Band4 - Band3) / (Band4 + Band3)',
  {
    Band4: L5_composite5.select('B4'),
    Band3: L5_composite5.select('B3')
  }
  );
var ndvi_1985 = L5_composite6.expression(
  '(Band4 - Band3) / (Band4 + Band3)',
  {
    Band4: L5_composite6.select('B4'),
    Band3: L5_composite6.select('B3')
  }
  );
var ndvi_1984 = L5_composite7.expression(
  '(Band4 - Band3) / (Band4 + Band3)',
  {
    Band4: L5_composite7.select('B4'),
    Band3: L5_composite7.select('B3')
  }
  );
var ndvi_1986 = L5_composite8.expression(
  '(Band4 - Band3) / (Band4 + Band3)',
  {
    Band4: L5_composite8.select('B4'),
    Band3: L5_composite8.select('B3')
  }
  );
/* ----------------------------------------- Mask ---------------------------------------------------
Take an empty image and applies a 1 to where the NDVI values fall below the previously set threshold. */
var blank = ee.Image(0);
var LowNDVI_L8_2015 = blank.where(ndvi_2015.lte(NDVI_Threshold),1);
var LowNDVI_L8_2014 = blank.where(ndvi_2014.lte(NDVI_Threshold),1);
var LowNDVI_L8_2013 = blank.where(ndvi_2013.lte(NDVI_Threshold),1);
var LowNDVI_L7_2012 = blank.where(ndvi_2012.lte(NDVI_Threshold),1);
var LowNDVI_L5_2011 = blank.where(ndvi_2011.lte(NDVI_Threshold),1);
var LowNDVI_L5_2010 = blank.where(ndvi_2010.lte(NDVI_Threshold),1);
var LowNDVI_L5_2008 = blank.where(ndvi_2008.lte(NDVI_Threshold),1);
var LowNDVI_L5_1995 = blank.where(ndvi_1995.lte(NDVI_Threshold),1);
var LowNDVI_L5_1994 = blank.where(ndvi_1994.lte(NDVI_Threshold),1);
var LowNDVI_L5_1993 = blank.where(ndvi_1993.lte(NDVI_Threshold),1);
var LowNDVI_L5_1985 = blank.where(ndvi_1985.lte(NDVI_Threshold),1);
var LowNDVI_L5_1984 = blank.where(ndvi_1984.lte(NDVI_Threshold),1);
var LowNDVI_L5_1986 = blank.where(ndvi_1986.lte(NDVI_Threshold),1);
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
    <ColorMapEntry color="#d100ff" quantity="0" label="lte 0" opacity="0"/>\
    <ColorMapEntry color="#d100ff" quantity="0.5" label="0.5" />\
    <ColorMapEntry color="#d100ff" quantity="1" label="1" />\
  </ColorMap>\
</RasterSymbolizer>'; //PURPLE
var sld_intervals5 = '\
<RasterSymbolizer>\
  <ColorMap  type="intervals" extended="false" >\
    <ColorMapEntry color="#00d600" quantity="0" label="lte 0" opacity="0"/>\
    <ColorMapEntry color="#00d600" quantity="0.5" label="0.5" />\
    <ColorMapEntry color="#00d600" quantity="1" label="1" />\
  </ColorMap>\
</RasterSymbolizer>'; //GREEN
//Creates binary image containing the intersection between the LowVI and anything where the inverted mask is 1.
var MTR_1 = LowNDVI_L8_2015.and(mask_inverted_60m);
var MTR_2 = LowNDVI_L8_2014.and(mask_inverted_60m);
/*var MTR_3 = LowNDVI_L8_2013.and(mask_inverted_60m);
var MTR_4 = LowNDVI_L7_2012.and(mask_inverted_60m);
var MTR_5 = LowNDVI_L5_2011.and(mask_inverted_60m);
var MTR_6 = LowNDVI_L5_2010.and(mask_inverted_60m);
var MTR_7 = LowNDVI_L5_2008.and(mask_inverted_60m);
var MTR_8 = LowNDVI_L5_1995.and(mask_inverted_60m);
var MTR_9 = LowNDVI_L5_1994.and(mask_inverted_60m);
var MTR_10 = LowNDVI_L5_1993.and(mask_inverted_60m);
var MTR_11 = LowNDVI_L5_1985.and(mask_inverted_60m);
var MTR_12 = LowNDVI_L5_1984.and(mask_inverted_60m);
var MTR_13 = LowNDVI_L5_1986.and(mask_inverted_60m);*/
//Centers map and sets zoom for this API display
Map.setCenter(-81.58,37.92,12);
Map.addLayer(MTR_1.sldStyle(sld_intervals1), {min:0, max:1}, 'MTR 2015');
Map.addLayer(MTR_2.sldStyle(sld_intervals1), {min:0, max:1}, 'MTR 2014');
/*Map.addLayer(MTR_3.sldStyle(sld_intervals1), {min:0, max:1}, 'MTR 2013');
Map.addLayer(MTR_4.sldStyle(sld_intervals5), {min:0, max:1}, 'MTR 2012');
Map.addLayer(MTR_5.sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2011');
Map.addLayer(MTR_6.sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2010');
Map.addLayer(MTR_7.sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2008');
Map.addLayer(MTR_8.sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1995');
Map.addLayer(MTR_9.sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1994');
Map.addLayer(MTR_10.sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1993');
Map.addLayer(MTR_11.sldStyle(sld_intervals4), {min:0, max:1}, 'MTR 1985');
Map.addLayer(MTR_12.sldStyle(sld_intervals4), {min:0, max:1}, 'MTR 1984');
Map.addLayer(MTR_13.sldStyle(sld_intervals4), {min:0, max:1}, 'MTR 1986');*/
/*-------------------------- EXPORT RESULTS --------------------------------------------
Cuts AOI into quadrants for faster export time
Creates variables that contain geometry for AOIs*/
                                      //[   lower right,     upper left   ]
var geometryI   = ee.Geometry.Rectangle([-79.849, 37.3525, -82.421, 38.942]);
var geometryII  = ee.Geometry.Rectangle([-82.421, 37.3525, -84.993, 38.942]);
var geometryIII = ee.Geometry.Rectangle([-82.421, 35.763,  -84.993, 37.3525]);
var geometryIV  = ee.Geometry.Rectangle([-79.849, 35.763,  -82.421, 37.3525]);
/*Creates variables that contain the geometries in geoJson format
when exporting, region must be specified in geoJson format*/
var jsonCoordI   = geometryI.toGeoJSON();
var jsonCoordII  = geometryII.toGeoJSON();
var jsonCoordIII = geometryIII.toGeoJSON();
var jsonCoordIV  = geometryIV.toGeoJSON();
/*Creates variables containing CRS, CRS_TRANSFORM, and SCALE/RESOLUTION from IMAGE and MASK
  which is used by Export.image function. */
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
//var mask120m_crs = mask_input_120m.projection().atScale(30).getInfo()['crs'];
//var mask120m_crs_transform = mask_input_120m.projection().atScale(30).getInfo()['transform'];

/*----------------------------- Exports images -----------------------------*/
                                // LANDSAT 5 Images
/*
Export.image(L5_composite, 'L5_composite-SceneI', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordI});
Export.image(L5_composite, 'L5_composite-SceneII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordII});
Export.image(L5_composite, 'L5_composite-SceneIII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIII});
Export.image(L5_composite, 'L5_composite-SceneIV', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIV});
                                // LANDSAT 7 Images
Export.image(L7_composite, 'L7_composite-SceneI', {crs: lsat7_crs, crs_transform: lsat7_crs_transform, region: jsonCoordI});
Export.image(L7_composite, 'L7_composite-SceneII', {crs: lsat7_crs, crs_transform: lsat7_crs_transform, region: jsonCoordII});
Export.image(L7_composite, 'L7_composite-SceneIII', {crs: lsat7_crs, crs_transform: lsat7_crs_transform, region: jsonCoordIII});
Export.image(L7_composite, 'L7_composite-SceneIV', {crs: lsat7_crs, crs_transform: lsat7_crs_transform, region: jsonCoordIV});
                                // LANDSAT 8 Images
Export.image(L8_composite, 'L8_composite-SceneI', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordI});
Export.image(L8_composite, 'L8_composite-SceneII', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordII});
Export.image(L8_composite, 'L8_composite-SceneIII', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIII});
Export.image(L8_composite, 'L8_composite-SceneIV', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIV});
*/
                          // Exporting VI Data as Scenes
/*
Export.image(ndvi_L5, 'L5-NDVI-SceneI', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordI});
Export.image(ndvi_L5, 'L5-NDVI-SceneII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordII});
Export.image(ndvi_L5, 'L5-NDVI-SceneIII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIII});
Export.image(ndvi_L5, 'L5-NDVI-SceneIV', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIV});

Export.image(ndvi_L7, 'L7-NDVI-SceneI', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordI});
Export.image(ndvi_L7, 'L7-NDVI-SceneII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordII});
Export.image(ndvi_L7, 'L7-NDVI-SceneIII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIII});
Export.image(ndvi_L7, 'L7-NDVI-SceneIV', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIV});

Export.image(ndvi_L8, 'L8-NDVI-SceneI', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordI});
Export.image(ndvi_L8, 'L8-NDVI-SceneII', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordII});
Export.image(ndvi_L8, 'L8-NDVI-SceneIII', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIII});
Export.image(ndvi_L8, 'L8-NDVI-SceneIV', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIV});
*/
                          // Exporting MTR Sites
//Export.image(MTR_1, '2015-MTR_Scene-1', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordI});
//Export.image(MTR_1, '2015-MTR_Scene-2', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordII});
//Export.image(MTR_1, '2015-MTR_Scene-3', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIII});
//Export.image(MTR_1, '2015-MTR_Scene-4', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIV});
          // USE ^^ for any Landsat 8 based MTR classification
//Export.image(MTR_4, '2012-MTR_Scene-1', {crs: lsat7_crs, crs_transform: lsat7_crs_transform, region: jsonCoordI});
//Export.image(MTR_4, '2012-MTR_Scene-2', {crs: lsat7_crs, crs_transform: lsat7_crs_transform, region: jsonCoordII});
//Export.image(MTR_4, '2012-MTR_Scene-3', {crs: lsat7_crs, crs_transform: lsat7_crs_transform, region: jsonCoordIII});
//Export.image(MTR_4, '2012-MTR_Scene-4', {crs: lsat7_crs, crs_transform: lsat7_crs_transform, region: jsonCoordIV});
          // USE ^^ for any Landsat 7 based MTR classification
//Export.image(MTR_8, '1995-MTR_Scene-1', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordI});
//Export.image(MTR_8, '1995-MTR_Scene-2', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordII});
//Export.image(MTR_8, '1995-MTR_Scene-3', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIII});
//Export.image(MTR_8, '1995-MTR_Scene-4', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIV});
          // USE ^^ for any Landsat 5 based MTR classification

//Note: When running export from Tasks tab, make sure to specify a google drive folder that already exists
//      in the user's Google Drive. Alternatively, add a driveFolder parameter to the Export.image function
//      with existing Google Drive folder name for more convenient exporting.


// Reclaimed Mine Classification: Early Date - Later Date
//THIS WORKS
// Areas which are classified as mine land in earlier image but not later image, are now classified as reclaimed
// mine land.
var reclaimed = MTR_2.subtract(MTR_1);
Map.addLayer(reclaimed.sldStyle(sld_intervals5), {min:0, max:1}, 'reclaim');


/*
// Kroodsma Area Calculation work:

// Get a pixel area image, which will apply to any scale you provide
var pixelArea = ee.Image.pixelArea();

// Function to reduce region to get statistics of area
function get_area(layerName, theLayer){
  var areaIAll = theLayer.multiply(pixelArea).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometryI,
    scale: 30,
    maxPixels: 1e9
   });
   var areaSqKm = ee.Number(areaIAll.get('constant')).divide(1000*1000);
  print(layerName, areaSqKm);
  return areaSqKm;
}
get_area("MTR_1 Area in Sq Km: ", MTR_1);

// Get a pixel area image, which will apply to any scale you provide
var PA = ee.Image.pixelArea();

function GA(layerName, theLayer){
  var areaIAll = theLayer.multiply(PA).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometryII,
    scale: 30,
    maxPixels: 1e9
   });
   var areaSqKm = ee.Number(areaIAll.get('constant')).divide(1000*1000);
  print(layerName, areaSqKm);
  return areaSqKm;
}
GA("MTR_1 Area2 in Sq Km: ", MTR_1);
*/
