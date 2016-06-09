/*/////////////////////////////////////////////////////////////////////////////////////////////////////
   This script was created by SkyTruth to identify possible active mountaintop removal and other
   surface coal mining, using a Normalized Difference Vegetation Index with an applied threshold.
//////////////////////////////////////////////////////////////////////////////////////////////////////

/***************** SET NDVI THRESHOLD ***************************************************************/
/* Sets a threshold value that may be applied to the NDVI layer to seperate the values into
   two classes: '1' where possible mining is <= threshold, and '0' where vegetation is > threshold.  */
var NDVI_Threshold = 0.54;


/***************** CREATE MASK **********************************************************************/
/* Imports mask (created by SkyTruth) which contains roads and rivers, buffered by 60m, as well
   as urban areas (unbuffered), which typically have low NDVI values similar to active mining.
   The mask may be applied to reduce the possibility of classifying these features as visible
   active mining.*/

//Imports mask/Creates variable containing imported mask
var mask_input = ee.Image('GME/images/06136759344167181854-02242958771191394493');

//Takes an empty image and applies a 1 to everything outside of the masked area (inverts mask_input)
    //ie. New image returns everything that isn't a road, river, etc.
var blank_mask = ee.Image(0);
var mask_inverted = blank_mask.where(mask_input.lte(0),1);


/***************** CREATE GREENEST PIXEL COMPOSITE AND NDVI *****************************************/
//Imports a greenest pixel composite for Landsat5 imagery
var composite = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate( '2005-01-01', '2005-12-31')
  .first());

//Calculates an NDVI from the greenest pixel composite and creates a new image
//  Pixel values in NDVI range from 0-1; 0 is more likely to be bare earth, 1 is more likely to be vegetation
var NDVI = composite.expression(
  '(nir - red) / (nir + red)',
  {
      red: composite.select('B3'),
      nir: composite.select('B4')
  });

//Takes an empty image and applies a 1 where the NDVI values fall below the previously set threshold.
var blank = ee.Image(0);
var LowNDVI = blank.where(NDVI.lte(NDVI_Threshold), 1);

//Creates binary image containing the intersection between the LowNDVI and anything where the inverted mask is 1
var MTR = LowNDVI.and(mask_inverted);

/***************** VISUALIZE IN MAP DISPLAY *********************************************************/
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

//Centers map and sets zoom for this API display       FORMAT:(Longitude, Latitude, Zoom-level)
Map.setCenter(-81.58,37.92,12);
//Adds layers to display in this API
Map.addLayer(LowNDVI.sldStyle(sld_intervals1), {}, 'Low NDVI' );

//^^^^^
//The style only applies in api; the style doesn't export with the data

/***************** EXPORT RESULTS *******************************************************************/
////*Cuts AOI into quadrants for faster export time*
//Creates variables that contain geometry for AOIs
                                      //[   lower right,     upper left   ]
var geometryI   = ee.Geometry.Rectangle([-79.849, 37.3525, -82.421, 38.942]);
var geometryII  = ee.Geometry.Rectangle([-82.421, 37.3525, -84.993, 38.942]);
var geometryIII = ee.Geometry.Rectangle([-82.421, 35.763,  -84.993, 37.3525]);
var geometryIV  = ee.Geometry.Rectangle([-79.849, 35.763,  -82.421, 37.3525]);
//Creates variables that contain the geometries in geoJson format
//**when exporting, region must be specified in geoJson format**
var jsonCoordI   = geometryI.toGeoJSON();
var jsonCoordII  = geometryII.toGeoJSON();
var jsonCoordIII = geometryIII.toGeoJSON();
var jsonCoordIV  = geometryIV.toGeoJSON();

//Creates variables containing CRS, CRS_TRANSFORM, and SCALE/RESOLUTION from IMAGE and MASK
//  which is used by Export.image function
var lsat_crs = composite.projection().atScale(30).getInfo()['crs'];
var lsat_crs_transform = composite.projection().atScale(30).getInfo()['transform'];

//.atScale() -- pixel size of image ie. for landsat .atScale(30) because landsat pixels are 30m,
//.getinfo() extracts the data; .getInfo()['crs'] extracts the crs data from the composite

var mask_crs = mask_input.projection().atScale(30).getInfo()['crs'];
var mask_crs_transform = mask_input.projection().atScale(30).getInfo()['transform'];


//Exports images
Export.image(composite, 'composite-SceneI', {crs: lsat_crs, crs_transform: lsat_crs_transform, region: jsonCoordI});
Export.image(composite, 'composite-SceneII', {crs: lsat_crs, crs_transform: lsat_crs_transform, region: jsonCoordII});
Export.image(composite, 'composite-SceneIII', {crs: lsat_crs, crs_transform: lsat_crs_transform, region: jsonCoordIII});
Export.image(composite, 'composite-SceneIV', {crs: lsat_crs, crs_transform: lsat_crs_transform, region: jsonCoordIV});

Export.image(NDVI, 'NDVI-SceneI', {crs: lsat_crs, crs_transform: lsat_crs_transform, region: jsonCoordI});
Export.image(NDVI, 'NDVI-SceneII', {crs: lsat_crs, crs_transform: lsat_crs_transform, region: jsonCoordII});
Export.image(NDVI, 'NDVI-SceneIII', {crs: lsat_crs, crs_transform: lsat_crs_transform, region: jsonCoordIII});
Export.image(NDVI, 'NDVI-SceneIV', {crs: lsat_crs, crs_transform: lsat_crs_transform, region: jsonCoordIV});

//Note: When running export from Tasks tab, make sure to specify a google drive folder that already exists
//      in the user's Google Drive. Alternatively, add a driveFolder parameter to the Export.image function
//      with existing Google Drive folder name for more convenient exporting.

Map.addLayer(MTR, {min:0, max:1}, 'MTR');
//Map.addLayer(image, {min:0, max:1}, 'mask');
// var mean = image.reduceRegion({
// reducer: ee.Reducer.mean(),
// geometry: region.geometry(),
// scale: 30,
// maxPixels: 1e9,
// bestEffort: true,
// });
var MTRI = MTR.clip(geometryI);

//var mean = MTRI.reduceRegion(ee.Reducer.sum(), geometryI, 30);
//print(mean);

//Map.addLayer(mask_input, {min:0, max:1}, 'mask_input');
