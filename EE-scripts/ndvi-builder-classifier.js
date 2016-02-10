/*/////////////////////////////////////////////////////////////////////////////////////////////////////
   This script was created by SkyTruth to identify possible active mountaintop removal and other
   surface coal mining while testing the comparison between: a Normalized Difference Vegetation Index
   with an applied threshold (0.54 as determined by Tita's testing, a Soil Adjusted Vegetation Index
   (threshold TBD), and an Enhanced Vegetation Index (threshold TBD). The script draws heavily from
   the script developed by Tita, which can be found here:
                          https://code.earthengine.google.com/613fc495207c52ec162241da8b65207d
/////////////////////////////////////////////////////////////////////////////////////////////////////*/


/*------------------------------------ Set Thresholds -------------------------------------------------*/
/* Sets a threshold value that may be applied to the VI layers to seperate the values into
   two classes: '1' where possible mining is <= threshold, and '0' where vegetation is > threshold.  */

// NDVI Threshold -- Tita used 0.54 as her NDVI Threshold
var NDVI_Threshold = 0.54;
// SAVI Threshold
var SAVI_Threshold = 0.35;
// EVI Threshold
var EVI_Threshold = 0.54;

/*------------------------------------- Create Mask ---------------------------------------------------*/
/* Import the masks created by SkyTruth which contains rivers and roads (which are buffered by 60 or
   120 meters), as well as urban areas (which are unbuffered), these have low reflectance values similar
   to active mining. The mask may be applied to reduce the possibility of classifying these features as
   visible active mining. */

//Imports 60 meter mask/creates variable containing imported mask
var mask_input_60m = ee.Image('users/christian/60m-mask-total-area');


//Imports 120 meter mask/creates variable containing imported mask
var mask_input_120m = ee.Image('users/christian/120m-mask-total-area');

//Takes an empty image and applies a 1 to everything outside of the masked area (inverts mask_input)
    //ie. New image returns everything that isn't a road, river, etc.
var blank_mask = ee.Image(0);

var mask_inverted_60m = blank_mask.where(mask_input_60m.lte(0),1);
var mask_inverted_120m = blank_mask.where(mask_input_120m.lte(0),1);

/*--------------------------------- Create Greenest Pixel Composite -----------------------------------*/
//Imports a greenest pixel composite for Landsat5 imagery (currently set for 2005)
var L5_composite = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2005-01-01', '2005-12-31')
  .first());

//Imports a greenest pixel composite for Landsat8 imagery (currently set for 2014). Landsat 8 needs to be
//converted to float32 for export from EE to Google Drive.
var L8_composite = ee.Image(ee.ImageCollection('LANDSAT/LC8_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2014-01-01', '2014-12-31')
  .mean()
  .toFloat());


/*----------------------------------- Calculate Vegitation Indices ------------------------------------*/
/* -------------------------- NDVI ----------------------------------------
NORMALIZED DIFFERENCE VEGETATION INDEX


Formula: NDVI =   (NIR - RED)
                 --------------
                  (NIR + RED)

NDVI is measured on scale of -1 to 1, though values below 0 are uncommon;
the scale used here is from 0 to 1. Lower values correspond to less dense
vegetation and are more likely to be bare ground.
---------------------------------------------------------------------------- */

var ndvi_L5 = L5_composite.expression(
  '(Band4 - Band3) / (Band4 + Band3)',
  {
    Band4: L5_composite.select('B4'),
    Band3: L5_composite.select('B3')
  }
  );

var ndvi_L8 = L8_composite.expression(
  '(Band5 - Band4) / (Band5 + Band4)',
  {
    Band5: L8_composite.select('B5'),
    Band4: L8_composite.select('B4')
  }
  );

/* -------------------------------------- SAVI -------------------------------------------------
SOIL ADJUSTED VEGETATION INDEX

SAVI is a modified NDVI.
L is a soil adjustment factor, it has a default value of 0.5

Formula: SAVI =               (NIR - RED)
                (1 + L) * -------------------
                            (NIR + RED + L)

See more about SAVI at:
http://www.researchgate.net/publication/223906415_A_Modified_Soil_Adjusted_Vegetation_Index
or
http://wiki.landscapetoolbox.org/doku.php/remote_sensing_methods:soil-adjusted_vegetation_index
------------------------------------------------------------------------------------------------ */
var savi_L5 = L5_composite.expression(
  '((Band4 - Band3) / (Band4 + Band3 + L)) * (1 + L)',
  {
    Band4: L5_composite.select('B4'),
    Band3: L5_composite.select('B3'),
    L: 0.50
  }
  );

var savi_L8 = L8_composite.expression(
  '((Band5 - Band4) / (Band5 + Band4 + L)) * (1 + L)',
  {
    Band5: L8_composite.select('B5'),
    Band4: L8_composite.select('B4'),
    L: 0.50
  }
  );

/* ------------------------------------- EVI -----------------------------------------------------------
ENHANCED VEGETATION INDEX

EVI is an optimized vegetation index

Formula: EVI =                (NIR - RED)
               G *  --------------------------------
                    (NIR + (C1 * RED) - (C2 * Blue) + L)

  G = 2.5
  L = 1   N.B in calculations X will be substituted for L to avoid confustion with SAVI calculations
  C1 = 6
  C2 = 7.5

See more about EVI at:
https://en.wikipedia.org/wiki/Enhanced_vegetation_index
OR
http://www.mdpi.com/1424-8220/7/11/2636/htm
------------------------------------------------------------------------------------------------------ */
var evi_L5 = L5_composite.expression(
  'G * ((Band4 - Band3) / (Band4 + (C1 * Band3) - (C2 * Band1) + X))',
  {
    Band4: L5_composite.select('B4'),
    Band3: L5_composite.select('B3'),
    Band1: L5_composite.select('B1'),
    G: 2.5,
    C1: 6,
    C2: 7.5,
    X: 1
  }
  );

var evi_L8 = L8_composite.expression(
  'G * ((Band5 - Band4) / (Band5 + (C1 * Band4) - (C2 * Band2) + X))',
  {
    Band5: L8_composite.select('B5'),
    Band4: L8_composite.select('B4'),
    Band2: L8_composite.select('B2'),
    G: 2.5,
    C1: 6,
    C2: 7.5,
    X: 1
  }
  );

/* ----------------------------------------- Mask ---------------------------------------------------
Take an empty image and applies a 1 to where the VI values fall below the previously set threshold. */
var blank = ee.Image(0);

var LowNDVI_L5 = blank.where(ndvi_L5.lte(NDVI_Threshold),1);
var LowNDVI_L8 = blank.where(ndvi_L8.lte(NDVI_Threshold),1);

var LowSAVI_L5 = blank.where(savi_L5.lte(SAVI_Threshold),1);
var LowSAVI_L8 = blank.where(savi_L8.lte(SAVI_Threshold),1);

var LowEVI_L5 = blank.where(evi_L5.lte(EVI_Threshold),1);
var LowEVI_L8 = blank.where(evi_L8.lte(EVI_Threshold),1);


//Creates binary image containing the intersection between the LowVI and anything where the inverted mask is 1
//--------------- 60 meter mask -----------------
var MTR_1 = LowNDVI_L5.and(mask_inverted_60m);
var MTR_2 = LowNDVI_L8.and(mask_inverted_60m);
var MTR_3 = LowSAVI_L5.and(mask_inverted_60m);
var MTR_4 = LowSAVI_L8.and(mask_inverted_60m);
var MTR_5 = LowEVI_L5.and(mask_inverted_60m);
var MTR_6 = LowEVI_L8.and(mask_inverted_60m);

/*
//-------------- 120 meter mask ----------------
var MTR_7 = LowNDVI_L5.and(mask_inverted_120m);
var MTR_8 = LowNDVI_L8.and(mask_inverted_120m);
var MTR_9 = LowSAVI_L5.and(mask_inverted_120m);
var MTR_10 = LowSAVI_L8.and(mask_inverted_120m);
var MTR_11 = LowEVI_L5.and(mask_inverted_120m);
var MTR_12 = LowEVI_L8.and(mask_inverted_120m);
*/


//-------------------------- VISUALIZE IN MAP DISPLAY --------------------------------------------
/* Creates styles which can be applied by the Map.addLayer function for the purpose of
   visualizing map layers inside this API.*/
var sld_intervals1 = '\
<RasterSymbolizer>\
  <ColorMap  type="intervals" extended="false" >\
    <ColorMapEntry color="#999999" quantity="0" label="lte 0" opacity="0"/>\
    <ColorMapEntry color="#00ffff" quantity="0.5" label="0.5" />\
    <ColorMapEntry color="#00ff00" quantity="1" label="1" />\
  </ColorMap>\
</RasterSymbolizer>';

var sld_intervals2 = '\
<RasterSymbolizer>\
  <ColorMap  type="intervals" extended="false" >\
    <ColorMapEntry color="#999999" quantity="0" label="lte 0" opacity="0"/>\
    <ColorMapEntry color="#0099ff" quantity="1" label="1" />\
  </ColorMap>\
</RasterSymbolizer>';

var sld_intervals3 = '\
<RasterSymbolizer>\
  <ColorMap  type="intervals" extended="false" >\
    <ColorMapEntry color="#999999" quantity="0" label="lte 0" opacity="0"/>\
    <ColorMapEntry color="#0000ff" quantity="1" label="1" />\
  </ColorMap>\
</RasterSymbolizer>';

//Centers map and sets zoom for this API display
Map.setCenter(-81.58,37.92,12);
//Adds layers to display in this API
Map.addLayer(LowNDVI_L5.sldStyle(sld_intervals1), {}, 'Low NDVI L5' );
Map.addLayer(LowNDVI_L8.sldStyle(sld_intervals1), {}, 'Low NDVI L8' );
Map.addLayer(LowSAVI_L5.sldStyle(sld_intervals1), {}, 'Low SAVI L5' );
Map.addLayer(LowSAVI_L8.sldStyle(sld_intervals1), {}, 'Low SAVI L8' );
Map.addLayer(LowEVI_L5.sldStyle(sld_intervals1), {}, 'Low EVI L5' );
Map.addLayer(LowEVI_L8.sldStyle(sld_intervals1), {}, 'Low EVI L8' );


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
var lsat8_crs = L8_composite.projection().atScale(30).getInfo()['crs'];
var lsat8_crs_transform = L8_composite.projection().atScale(30).getInfo()['transform'];

  //.atScale() -- pixel size of image ie. for landsat .atScale(30) because landsat pixels are 30m,
  //.getinfo() extracts the data; .getInfo()['crs'] extracts the crs data from the composite

var mask60m_crs = mask_input_60m.projection().atScale(30).getInfo()['crs'];
var mask60m_crs_transform = mask_input_60m.projection().atScale(30).getInfo()['transform'];
/*var mask120m_crs = mask_input_120m.projection().atScale(30).getInfo()['crs'];
var mask120m_crs_transform = mask_input_120m.projection().atScale(30).getInfo()['transform'];*/

/*----------------------------- Exports images -----------------------------*/
                                // LANDSAT 5 Images
/*
Export.image(L5_composite, 'L5_composite-SceneI', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordI});
Export.image(L5_composite, 'L5_composite-SceneII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordII});
Export.image(L5_composite, 'L5_composite-SceneIII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIII});
Export.image(L5_composite, 'L5_composite-SceneIV', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIV});
*/
                                // LANDSAT 8 Images
Export.image(L8_composite, 'L8_composite-SceneI', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordI});
Export.image(L8_composite, 'L8_composite-SceneII', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordII});
Export.image(L8_composite, 'L8_composite-SceneIII', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIII});
Export.image(L8_composite, 'L8_composite-SceneIV', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIV});


                          // Exporting VI Data as Scenes
/*
Export.image(ndvi_L5, 'L5-NDVI-SceneI', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordI});
Export.image(ndvi_L5, 'L5-NDVI-SceneII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordII});
Export.image(ndvi_L5, 'L5-NDVI-SceneIII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIII});
Export.image(ndvi_L5, 'L5-NDVI-SceneIV', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIV});

Export.image(ndvi_L8, 'L8-NDVI-SceneI', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordI});
Export.image(ndvi_L8, 'L8-NDVI-SceneII', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordII});
Export.image(ndvi_L8, 'L8-NDVI-SceneIII', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIII});
Export.image(ndvi_L8, 'L8-NDVI-SceneIV', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIV});

Export.image(savi_L5, 'L5-SAVI-SceneI', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordI});
Export.image(savi_L5, 'L5-SAVI-SceneII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordII});
Export.image(savi_L5, 'L5-SAVI-SceneIII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIII});
Export.image(savi_L5, 'L5-NDVI-SceneIV', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIV});

Export.image(savi_L8, 'L8-SAVI-SceneI', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordI});
Export.image(savi_L8, 'L8-SAVI-SceneII', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordII});
Export.image(savi_L8, 'L8-SAVI-SceneIII', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIII});
Export.image(savi_L8, 'L8-SAVI-SceneIV', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIV});

Export.image(evi_L5, 'L5-EVI-SceneI', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordI});
Export.image(evi_L5, 'L5-EVI-SceneII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordII});
Export.image(evi_L5, 'L5-EVI-SceneIII', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIII});
Export.image(evi_L5, 'L5-EVI-SceneIV', {crs: lsat5_crs, crs_transform: lsat5_crs_transform, region: jsonCoordIV});

Export.image(evi_L8, 'L8-EVI-SceneI', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordI});
Export.image(evi_L8, 'L8-EVI-SceneII', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordII});
Export.image(evi_L8, 'L8-EVI-SceneIII', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIII});
Export.image(evi_L8, 'L8-EVI-SceneIV', {crs: lsat8_crs, crs_transform: lsat8_crs_transform, region: jsonCoordIV});
*/

//Note: When running export from Tasks tab, make sure to specify a google drive folder that already exists
//      in the user's Google Drive. Alternatively, add a driveFolder parameter to the Export.image function
//      with existing Google Drive folder name for more convenient exporting.


/*------- Add MTR Classification for display in EarthEngine -------*/

Map.addLayer(MTR_1, {min:0, max:1}, 'MTR NDVI L5');
Map.addLayer(MTR_2, {min:0, max:1}, 'MTR NDVI L8');
Map.addLayer(MTR_3, {min:0, max:1}, 'MTR SAVI L5');
Map.addLayer(MTR_4, {min:0, max:1}, 'MTR SAVI L8');
Map.addLayer(MTR_5, {min:0, max:1}, 'MTR EVI L5');
Map.addLayer(MTR_6, {min:0, max:1}, 'MTR EVI L8');