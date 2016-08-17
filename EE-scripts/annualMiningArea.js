/*//////////////////////////////////////////////////////////////////////////////
   This script was created by SkyTruth to identify possible active mountaintop
   removal and other surface coal mining. This script requires an input 
   ImageCollection, generated with the greenestCompositesToAssets script.

/*------------------ IMPORT GREENEST COMPOSITE FEATURE COLLECTION ----------- */
var greenestComposites = ee.ImageCollection("users/andrewpericak/miningComposites");

/*------------------ IMPORT STUDY AREA & EXPORT AREAS ----------------------- */
// https://www.google.com/fusiontables/DataSource?docid=1Lphn5PR9YbneoY4sPkKGMUOJcurihIcCx0J82h7U
var studyArea = ee.FeatureCollection('ft:1Lphn5PR9YbneoY4sPkKGMUOJcurihIcCx0J82h7U');

var geometryI = /* color: d63000 */ee.Feature(
        ee.Geometry.Polygon(
            [[[-79.612, 39.037],
              [-79.612, 37.3525],
              [-82.421, 37.3525],
              [-82.421, 39.037]]]),
        {
          "system:index": "0"
        }),
    geometryII = /* color: 98ff00 */ee.Feature(
        ee.Geometry.Polygon(
            [[[-82.421, 38.942],
              [-82.421, 37.3525],
              [-84.993, 37.3525],
              [-84.993, 38.942]]]),
        {
          "system:index": "0"
        }),
    geometryIII = /* color: 0B4A8B */ee.Feature(
        ee.Geometry.Polygon(
            [[[-82.421, 37.3525],
              [-82.421, 35.637],
              [-85.811, 35.637],
              [-85.811, 37.3525]]]),
        {
          "system:index": "0"
        }),
    geometryIV = /* color: ffc82d */ee.Feature(
        ee.Geometry.Polygon(
            [[[-79.849, 37.3525],
              [-79.849, 35.763],
              [-82.421, 35.763],
              [-82.421, 37.3525]]]),
        {
          "system:index": "0"
        });

/*---------------------------- SET NDVI THRESHOLDS ---------------------------*/
// These thresholds set per each year (and associated sensor) using Otsu method; 
// see https://github.com/SkyTruth/MTR/blob/master/EE-scripts/OtsuThresholds.js
// Note: For the period [1974 - 1982], the script runs on three years' worth of
// imagery at a time; this table indicates which three-year periods:
//     Key  = 3-year period
//    -------------------
//    1974  =   1972-1974
//    1977  =   1975-1977
//    1980  =   1978-1980
//    1982  =   1981-1982
// Note: 1983 is omitted due to lack of quality imagery

var thresholds = ee.Dictionary({
  1974: 0.4699,   1977: 0.5950,   1980: 0.5749,   1982: 0.5375,   1984: 0.5154,
  1985: 0.5120,   1986: 0.5425,   1987: 0.5199,   1988: 0.5290,   1989: 0.4952,
  1990: 0.5022,   1991: 0.4940,   1992: 0.4892,   1993: 0.5237,   1994: 0.5467,
  1995: 0.5494,   1996: 0.5574,   1997: 0.5327,   1998: 0.5229,   1999: 0.5152,
  2000: 0.5063,   2001: 0.5456,   2002: 0.5242,   2003: 0.5239,   2004: 0.5821,
  2005: 0.5401,   2006: 0.5552,   2007: 0.5609,   2008: 0.5454,   2009: 0.5443,
  2010: 0.5250,   2011: 0.5305,   2012: 0.5465,   2013: 0.5812,   2014: 0.5750,   
  2015: 0.5927
});

/*------------------------------ IMPORT MASKS --------------------------------*/
var mask_input_60m_2015 = ee.Image('users/jerrilyn/2015mask-PM-fullstudy-area');
// Roads, water bodies, urban areas, etc., buffered 60 m
// Get the link here: https://drive.google.com/file/d/0B_MArPTqurHudFp6STU4ZzJHRmc/view

var miningPermits = ee.Image('users/andrewpericak/allMinePermits');
// All surface mining permits, buffered 1000 m
// Get the link here: https://drive.google.com/file/d/0B_PTuMKVy7beSWdZUkJIS3hneW8/view

var miningPermits_noBuffer = ee.Image('users/andrewpericak/allMinePermits_noBuffer');
// All surface mining permits, without any buffer

// This excludes from the 60 m mask (mask_input_60m_2015) any areas within the
// the mine permit boundaries. Since the 60 m mask is "inversed" (i.e., 0 means
// keep and 1 means eventually mask), this line sets the mine permit areas
// (labeled as 1) to 0.
var mask_input_excludeMines = mask_input_60m_2015.where(miningPermits_noBuffer.eq(1), 0);

// Choose your favorite area of interest! Comment out all but one:
//Map.centerObject(studyArea);        // Full study extent
//Map.setCenter(-81.971744, 38.094253, 12);     // Near Spurlockville, WV
//Map.setCenter(-82.705444, 37.020257, 12);     // Near Addington, VA
//Map.setCenter(-83.224567, 37.355144, 11);     // Near Dice, KY
//Map.setCenter(-83.931184, 36.533646, 12);     // Near Log Mountain, TN


/*------------------------------ MINE ANALYSIS -------------------------------*/

// Below, for each image in the ImageCollection created in the other script,
// determine whether a pixel is or isn't a mine based on NDVI and given
// threshold.
var composites = ee.ImageCollection(greenestComposites.map(function(image) {
  
  var year = image.get("year"); // Remember to add this property to the IC!
  var ndvi = image.select("NDVI");
  
  // This pulls the specific threshold for that year from the dictionary above
  var threshold = thresholds.get(ee.Number(year).format('%d'));
  var lowNDVI = ndvi.lte(ee.Image.constant(threshold));
  
  // Create binary image containing the intersection between the LowNDVI and 
  // anywhere the inverted mask is 0
  var mtr = lowNDVI.and(mask_input_excludeMines.eq(0));
  
  // Erode/dilate MTR sites to remove outliers (pixel clean-up)
  var mtrCleaned = mtr
    .reduceNeighborhood(ee.Reducer.min(), ee.Kernel.euclidean(30, 'meters'))  // erode
    .reduceNeighborhood(ee.Reducer.max(), ee.Kernel.euclidean(60, 'meters'))  // dilate
    .reduceNeighborhood(ee.Reducer.min(), ee.Kernel.euclidean(30, 'meters')); // erode

  // Mask MTR by the erosion/dilation, and by mining permit locations buffered 
  // out 1 km
  var mtrMasked = mtrCleaned.updateMask(mtrCleaned).updateMask(miningPermits)
      .multiply(ee.Image.constant(year)) // I still don't know if we need this...
      .toFloat().rename('MTR');
  
  // Compute area per pixel
  var area = ee.Image.pixelArea().multiply(mtrMasked)
    .divide(ee.Image.constant(year)).rename('area');
  
  return image.addBands(mtrMasked).addBands(area);
}));


/*------------ SUMMARIZE MINING AREA PER FEATURE PER YEAR --------------------*/

var features = ee.FeatureCollection([geometryI, geometryII, geometryIII, geometryIV]);

// This creates a table listing the area of active mining per year, per 
// subregion noted above (to allow this to actually export)
var getFeatures = function(feature) {
  // collection is a collection of removal by year
  return composites.map(function(image) {
    var yearlyArea = image.select('area').reduceRegion({
      reducer: 'sum', 
      geometry: feature.geometry(), 
      scale: 30,
      maxPixels: 1e10
    });
    return image.set(yearlyArea);
  });
};
var miningArea = features.map(getFeatures).flatten();

// This will export the table to your Google Drive
Export.table.toDrive({
  collection: miningArea,
  description: "yearlyActiveMiningArea",
  fileFormat: "csv"
});
