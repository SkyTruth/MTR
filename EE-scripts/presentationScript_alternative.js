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
Map.setCenter(-81.971744, 38.094253, 12);     // Near Spurlockville, WV
//Map.setCenter(-82.705444, 37.020257, 12);     // Near Addington, VA
//Map.setCenter(-83.224567, 37.355144, 11);     // Near Dice, KY
//Map.setCenter(-83.931184, 36.533646, 12);     // Near Log Mountain, TN

// This list will contain all output images, so as to build an ImageCollection later
var allMTR_list = [];

/*--------------------------------- IMAGE SELECTION ---------------------------------
Select the right imagery based off years */

var imagery5 = ee.ImageCollection("LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA")
  .filterDate("1984-01-01","2011-12-31");

var imagery7 = ee.ImageCollection("LANDSAT/LE7_L1T_ANNUAL_GREENEST_TOA")
  .filterDate("2012-01-01","2012-12-31");

var imagery8 = ee.ImageCollection("LANDSAT/LC8_L1T_ANNUAL_GREENEST_TOA")
  .filterDate("2013-01-01","2015-12-31");

// Merge all datasets into one big ImageCollection (1 image / year)
var allImagery = imagery5.merge(imagery7).merge(imagery8);

/* -------------------------------- IMAGE PROCESSING -------------------------------- */

var findMTR = allImagery.map(function(image) {
  
  // Calculate NDVI (using normalizedDifference function; select correct bands per sensor)
  var NIRband = ee.Algorithms.If((ee.Date(image.get("system:time_start")).get("year").gte(2013)),
    ee.String("B5"), ee.String("B4"));
  var Rband = ee.Algorithms.If((ee.Date(image.get("system:time_start")).get("year").gte(2013)),
    ee.String("B4"), ee.String("B3"));

  var NDVI = ee.Image(image).normalizedDifference([NIRband,Rband]);
  
  // Create a mask of areas that ARE NOT mines (value of 1 to locations where NDVI is <= threshold)
  var blank = ee.Image(0);
  var lowNDVI = blank.where(NDVI.lte(NDVI_Threshold),1);
  
  // Create binary image containing the intersection between the LowNDVI and anywhere the inverted mask is 1
  var MTR = lowNDVI.and(mask_inverted_60m);
  
  // Clip MTR to extent of the Campagna study area
  var MTR_clipped = MTR.clip(campagna_study_area);
  
  // Erode/dilate MTR sites to remove outliers (pixel clean-up)
  var MTR_invert = blank.where(MTR_clipped.eq(0),1).where(MTR_clipped.eq(1),0);
  var MTR_invert_buffer = MTR_invert.distance(ee.Kernel.euclidean(30,'meters')).where(MTR_invert.eq(0),1).where(MTR_invert.eq(1),0);
  var MTR_in30 = MTR_clipped.subtract(MTR_invert_buffer);
  var final_invert = blank.where(MTR_in30.eq(0),0).where(MTR_in30.gte(0),1);
  var MTR_buffered_in = blank.where(final_invert.eq(0),1).where(final_invert.eq(1),0);
  var buffer_out = MTR_buffered_in.distance(ee.Kernel.euclidean(30,'meters'));
  var buffer_out_2 = buffer_out.where(MTR_in30.eq(0),0).where(MTR_in30.gte(0),1);
  var final_buffer_out = MTR_buffered_in.clip(campagna_study_area).add(buffer_out_2);
  
  // Output from the mapped function
  return final_buffer_out;
});

/* -------------------------------- DISPLAY -------------------------------------- */

// Create a list of images from the output ImageCollection (and figure out its length)
var outputList = findMTR.toList(50);
var listLength = outputList.length().getInfo();

// Run a loop to add each image from list to display
for (var i = 0; i < listLength; i++) {
  // This gets the image's year metadata and converts it into a JS literal (because it's easier that way)
  var year = ee.Number(ee.String(ee.Image(outputList.get(i)).get("system:index")).slice(-4)).getInfo();
  
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

  // For speed of display, only have years evenly divisible by 5 turned on by default
  if (year % 5 === 0){
    var display = true;
  }
  else {
    var display = false;
    }
  
  // Add all the layers to the display!
  Map.addLayer(ee.Image(outputList.get(i)), {palette: palette}, "MTR " + year, display); 
}




/* ------------------------- VIDEO OUTPUT ---------------------------------------------
Create an ImageCollection of all images, and use that to export a video 

var allMTR = ee.ImageCollection(allMTR_list).map(function(image){
  return image.addBands(image).addBands(image).uint8();
});

var videobounds = campagna_study_area.geometry().bounds().getInfo();
var video = Export.video.toDrive({
  collection: allMTR, 
  description: "MTRtimelapse",    // Filename, no spaces allowed
  framesPerSecond: 1,             // I.e., 1 year / second
  dimensions: 800,
  region: videobounds,
  scale: 60,                      // 60 m/pixel when exported, to match early LS
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
