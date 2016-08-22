/*//////////////////////////////////////////////////////////////////////////////
   This script was created by SkyTruth to identify possible active mountaintop
   removal and other surface coal mining. This script requires an input 
   ImageCollection, generated with the greenestCompositesToAssets script.

/*------------------ IMPORT GREENEST COMPOSITE FEATURE COLLECTION ----------- */
var greenestComposites = ee.ImageCollection("users/andrewpericak/miningComposites");

/*------------------ IMPORT STUDY AREA & EXPORT AREAS ----------------------- */
// https://www.google.com/fusiontables/DataSource?docid=1Lphn5PR9YbneoY4sPkKGMUOJcurihIcCx0J82h7U
var studyArea = ee.FeatureCollection('ft:1Lphn5PR9YbneoY4sPkKGMUOJcurihIcCx0J82h7U');

// var geometryI = /* color: d63000 */ee.Feature(
//         ee.Geometry.Polygon(
//             [[[-79.612, 39.037],
//               [-79.612, 37.3525],
//               [-82.421, 37.3525],
//               [-82.421, 39.037]]]),
//         {
//           "system:index": "0"
//         }),
//     geometryII = /* color: 98ff00 */ee.Feature(
//         ee.Geometry.Polygon(
//             [[[-82.421, 38.942],
//               [-82.421, 37.3525],
//               [-84.993, 37.3525],
//               [-84.993, 38.942]]]),
//         {
//           "system:index": "0"
//         }),
//     geometryIII = /* color: 0B4A8B */ee.Feature(
//         ee.Geometry.Polygon(
//             [[[-82.421, 37.3525],
//               [-82.421, 35.637],
//               [-85.811, 35.637],
//               [-85.811, 37.3525]]]),
//         {
//           "system:index": "0"
//         }),
//     geometryIV = /* color: ffc82d */ee.Feature(
//         ee.Geometry.Polygon(
//             [[[-79.849, 37.3525],
//               [-79.849, 35.763],
//               [-82.421, 35.763],
//               [-82.421, 37.3525]]]),
//         {
//           "system:index": "0"
//         });
// var features = ee.FeatureCollection([geometryI, geometryII, geometryIII, geometryIV]);
        
var fips_codes = [21013,21019,21025,21043,21051,21053,21063,21065,21071,21089,
                  21095,21109,21115,21119,21121,21125,21127,21129,21131,21133,
                  21135,21147,21153,21159,21165,21175,21189,21193,21195,21197,
                  21199,21203,21205,21231,21235,21237,47001,47013,47025,47035,
                  47049,47129,47133,47137,47141,47145,47151,51027,51051,51105,
                  51167,51169,51185,51195,51720,54005,54011,54015,54019,54025,
                  54039,54043,54045,54047,54053,54055,54059,54067,54075,54081,
                  54089,54099,54101,54109];

var allCounties =  ee.FeatureCollection('ft:1S4EB6319wWW2sWQDPhDvmSBIVrD3iEmCLYB7nMM');
var features = allCounties.filter(ee.Filter.inList('FIPS', fips_codes));

/*---------------------------- SET NDVI THRESHOLDS ---------------------------*/
// These thresholds set per each year (and associated sensor) using Otsu method; 
// see https://github.com/SkyTruth/MTR/blob/master/EE-scripts/OtsuThresholds.js
// Note: For the period [1974 - 1982], the script runs on three years' worth of
// imagery at a time; this table indicates which three-year periods:
//     Key  = 3-year period
//    -------------------
//    1972  =   1972-1974
//    1975  =   1975-1977
//    1978  =   1978-1980
//    1981  =   1981-1982
// Note: 1983 is omitted due to lack of quality imagery

var thresholds = ee.Dictionary({
  1972: 0.4639,   1975: 0.5731,   1978: 0.5899,   1981: 0.5465,   1984: 0.4946,
  1985: 0.5069,   1986: 0.5263,   1987: 0.5089,   1988: 0.5212,   1989: 0.4999,
  1990: 0.4791,   1991: 0.4638,   1992: 0.4646,   1993: 0.4946,   1994: 0.5244,
  1995: 0.5362,   1996: 0.5357,   1997: 0.5234,   1998: 0.4975,   1999: 0.5154,
  2000: 0.5064,   2001: 0.5533,   2002: 0.5413,   2003: 0.5201,   2004: 0.5320,
  2005: 0.5458,   2006: 0.5493,   2007: 0.5656,   2008: 0.5435,   2009: 0.5353,
  2010: 0.5344,   2011: 0.5404,   2012: 0.5224,   2013: 0.5434,   2014: 0.5545,   
  2015: 0.5753
});
// Other note: by using the full set of Landsat data (all sensors), then we 
// we may need to scrap Otsu altogether since using multiple sensors for one 
// year may not give us the bimodal distribution necessary for Otsu.

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
// threshold. Then perform various cleaning algorithms.

// This initially compares the NDVI at each pixel to the given threshold. The
// resulting images are 1 = mine and 0 = non-mine.
var rawMining = ee.ImageCollection(greenestComposites.map(function(image){
  var year = image.get("year");
  var ndvi = image.select("NDVI");
  
  // This pulls the specific threshold for that year from the dictionary above
  var threshold = thresholds.get(ee.Number(year).format('%d'));
  var lowNDVI = ndvi.lte(ee.Image.constant(threshold));
  return lowNDVI.set({"year": year});
}));

// This is the first step of the null-value cleaning (i.e., where there are no
// pixel values for that year due to cloud cover and a lack of raw imagery.)
// This function first creates a binary image where 1 = values that were null
// in the rawMining image, and where 0 = everything else.
var nullCleaning1 = ee.ImageCollection(rawMining.map(function(image){
  var year = image.get("year");
  var unmasked = image.lt(2).unmask().not().clip(studyArea);
  return unmasked.set({"year": year});
}));

// Create dummy images so the null cleaning will work; essentially for 1983 and
// 2016 (the years immediately before and after the years for which we have
// Landsat scenes), we need images of value 0 so that the nullCleaning2 function
// below actually works. Likewise for any of the MSS years, since we're doing
// those in many years at a time. This means we can't clean any null values from 
// 1984 or 2015 imagery, nor for 1972 - 1982.
var dummy1971 = ee.Image(0).rename("NDVI").set({"year": 1971}).clip(nullCleaning1.geometry());
var dummy1973 = ee.Image(0).rename("NDVI").set({"year": 1973}).clip(nullCleaning1.geometry());
var dummy1974 = ee.Image(0).rename("NDVI").set({"year": 1974}).clip(nullCleaning1.geometry());
var dummy1976 = ee.Image(0).rename("NDVI").set({"year": 1976}).clip(nullCleaning1.geometry());
var dummy1977 = ee.Image(0).rename("NDVI").set({"year": 1977}).clip(nullCleaning1.geometry());
var dummy1979 = ee.Image(0).rename("NDVI").set({"year": 1979}).clip(nullCleaning1.geometry());
var dummy1980 = ee.Image(0).rename("NDVI").set({"year": 1980}).clip(nullCleaning1.geometry());
var dummy1982 = ee.Image(0).rename("NDVI").set({"year": 1982}).clip(nullCleaning1.geometry());
var dummy1983 = ee.Image(0).rename("NDVI").set({"year": 1983}).clip(nullCleaning1.geometry());
var dummy2016 = ee.Image(0).rename("NDVI").set({"year": 2016}).clip(nullCleaning1.geometry());
var rawMining2 = ee.ImageCollection(rawMining.merge(ee.ImageCollection(
  [dummy1971,dummy1973,dummy1974,dummy1976,dummy1977,dummy1979,dummy1980,
   dummy1982,dummy1983,dummy2016])));

// This is the second step of the null-value cleaning. For each year, pull the
// raw mining images for the years immediately prior and future, where in those
// images 1 = mine and 0 = non-mine. Add those three images together; areas 
// where the sum is 3 indicate that the null pixel is likely a mine, because
// that pixel was a mine in the prior and future years.
var nullCleaning2 = ee.ImageCollection(nullCleaning1.map(function(image){
  var year = ee.Number(image.get("year"));
  var priorYr = year.subtract(1);
  var futureYr = year.add(1);
  
  var imgPrevious = rawMining2.filterMetadata("year","equals",priorYr).first();
  var imgNext = rawMining2.filterMetadata("year","equals",futureYr).first();
  var summation = image.add(imgPrevious).add(imgNext);
  var potentialMine = summation.eq(3);
  return potentialMine.set({"year": year});
}));

// This is the third step of the null-value cleaning. Use the results of the
// previous operation to turn any null values in the rawMining imagery into a
// value of 1 if they were also a value of 1 from the nullCleaning2 imagery.

var nullCleaning3 = ee.ImageCollection(rawMining.map(function(image){
  var year = image.get("year");
  var cleaningImg = nullCleaning2.filterMetadata("year","equals",year).first();
  var updatedRaw = image.unmask().add(cleaningImg);
  return updatedRaw.set({"year": year});
}));

// This performs other cleaning (mask, erosion/dilation, mine permit boundaries)
// to further clean up the mining dataset.
var mining = ee.ImageCollection(nullCleaning3.map(function(image){
  
  var year = image.get("year");
  // Create binary image containing the intersection between the LowNDVI and 
  // anywhere the inverted mask is 0
  var mtr = image.and(mask_input_excludeMines.eq(0));
  
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

// This creates a table listing the area of active mining per year, per 
// subregion noted above (to allow this to actually export)
var getFeatures = function(feature) {
  // collection is a collection of removal by year
  var fips = feature.get("FIPS");
  return mining.map(function(image) {
    var yearlyArea = image.select('area').reduceRegion({
      reducer: 'sum', 
      geometry: feature.geometry(), 
      scale: 30,
      maxPixels: 1e10
    });
    return image.set(yearlyArea).set({"FIPS": fips});
  });
};
var miningArea = features.map(getFeatures).flatten();

// This will export the table to your Google Drive
Export.table.toDrive({
  collection: miningArea,
  description: "yearlyActiveMiningArea",
  fileFormat: "csv"
});
