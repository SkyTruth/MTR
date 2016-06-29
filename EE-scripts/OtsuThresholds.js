/* AUTOMATIC IMAGE THRESHOLDING FROM THE OTSU METHOD
Andrew Pericak, June 2016

This script will automatically determine NDVI thresholds over mined landscapes. It uses the
Otsu method, which is a common image thresholding algorithm, to derive the threshold. The
Otsu method assumes a grayscale image (in our case, a one-band image of NDVI, which is also
the greenest pixel composite) has a bimodal distribution, which fits in our case since we 
have a low NDVI peak (mines) and a high NDVI peak (forest). The Otsu method then calculates
the threshold at the location where the within-class variance is maximized; i.e., where
the sum of the variances of each peak is minimized. Yay math! The resulting threshold yields
a binary image, which in our case would show mine versus not-mined.

This script imports yearly imagery and creates a greenest-pixel composite, masking that
composite by the magic mask. The user then specifies 30(ish) points in Earth Engine (manually 
drawing them) over the approximate centers of mines as seen in that year's imagery. These 
points will serve as the "training" data, and thus should be relatively spread out across the
study extent. The script then loops through each training point, buffering out that point a 
set distance (by default, a radius of 2500 m), and running the Otsu method using the pixels
falling within that buffer area. The script ultimately prints 30 unique thresholds to the 
Console; the user can then take the median (or mean) of those 30 thresholds to serve as the 
global threshold for this year's imagery, for this sensor.

NOTE! Because this script does so much in client-side JS, it takes a long time to run. Just 
leave the browser tab open and running; even if the screen goes blank or Chrome complains about
the page being frozen, just wait and let it finish.

See: Nobuyuki Otsu, "A Threshold Selection Method from Gray-Level Histograms," 
IEEE Transactions on Systems, Man, and Cybernetics, vol SMC-9, no. 1, 1979.
*/

/* -------------------------- IMAGERY AND SAMPLE LOCATIONS ------------------------------ */

// Import magic mask
var mask = ee.Image("users/christian/60m-mask-total-area").remap([0,1],[1,0]);

// Import study area extent
var extent = ee.FeatureCollection("ft:1sZzM7TFsdW0HDqewl4-zNAsSZCXEjAfPn8EYow5q").geometry();

// Import surface reflectance imagery for one calendar year, using a specified sensor
var LS5 = ee.ImageCollection("LANDSAT/LT5_SR")
  .filterBounds(extent)
  .filterDate("2010-01-01", "2010-12-31");

// Create the greenest pixel composite and extract image of just that band
var greenestComposite = LS5.map(function(image){
  var masked = image.updateMask(mask);
  var ndvi = masked.normalizedDifference(["B4","B3"]);
  return masked.addBands(ndvi);
});
var greenest = greenestComposite.qualityMosaic("nd").clip(extent);
var oneBand = greenest.select("nd");

// Convert greenest pixel composite to 8-bit image
var to8bit = oneBand.multiply(255).toUint8();

// The sample locations, stored as coordinates in a 2D array. With Earth Engine, we should use
// mapped functions, but there is so much in this script that requires non-EE JS that it's just
// easier to do it this way. But fun tip! Manually draw 30 points here in EE, then view the
// import record at the top of the screen to get this list. 
var samples = [[-81.91818237304688, 37.621641929508456],
             [-82.15850830078125, 37.68850707812409],
             [-83.47583770751953, 36.87732060073654],
             [-83.53145599365234, 36.731627266863654],
             [-82.70027160644531, 37.04127080777259],
             [-81.56112670898438, 37.224656017916615],
             [-81.49177551269531, 37.38178647925937],
             [-83.16375732421875, 37.39815310607879],
             [-82.89115905761719, 37.55455498147805],
             [-82.14906692504883, 37.07704183333351],
             [-80.6180191040039, 38.45026148698299],
             [-82.34458923339844, 37.759943333621074],
             [-81.74102783203125, 37.645066871883834],
             [-84.48503494262695, 36.551060382336196],
             [-82.05636978149414, 37.412820363193745],
             [-81.02485656738281, 38.34752955511982],
             [-81.46971702575684, 38.224333393965814],
             [-81.64867401123047, 38.20886543181951],
             [-81.96487426757812, 38.10344415389885],
             [-81.80660247802734, 37.82478551614655],
             [-81.5818977355957, 37.90189791954421],
             [-82.34008312225342, 38.150981052225475],
             [-83.15594673156738, 37.87040288078693],
             [-83.3371353149414, 37.3789731054448],
             [-83.99271011352539, 36.519819693258164],
             [-83.44038963317871, 36.770835367386375],
             [-82.71795272827148, 38.04150908548251],
             [-82.56843566894531, 37.37104393868458],
             [-82.67829895019531, 37.46538922434589],
             [-81.529541015625, 37.51425337095286]];

/* -------------------------- OTSU THRESHOLDING METHOD --------------------------- */

// A big for-loop to get variables and data ready for Otsu processing, and then to run the algorithm
for (var loc = 0; loc < samples.length; loc++){
  var point = ee.Geometry.Point(samples[loc]);

  // Set analysis buffer (i.e., radius) and get buffer geometry
  var bufferD = 2500;
  var ptBuffer = point.buffer(bufferD);

  // Construct a histogram with 256 buckets (some of which will usually be empty)
  var imgList = ee.List([]);
  for (var i = 1; i <= 256; i++){
    var blank = ee.Image(0);
    var rangeImg = blank.where(to8bit.gte(i-1).and(to8bit.lt(i)),i);
    var rangeMasked = rangeImg.updateMask(rangeImg.where(rangeImg.gte(1),1));
    var rangeCount = rangeMasked.reduceRegion({
      reducer: ee.Reducer.count(),
      geometry: ptBuffer,
      scale: 30, 
     maxPixels: 1e10
   });
    var value = rangeCount.get("constant");
    var imgList = imgList.add(value);
  }
  var histo = imgList.getInfo();

  // Determine how many non-masked pixels are within buffer
  var pixels = histo.reduce(function(a,b) {return a+b;},0); // Wheeeee JS! http://stackoverflow.com/questions/1230233/how-to-find-the-sum-of-an-array-of-numbers
  
  // Here is the Otsu thresholding method
  // Thanks, Wikipedia, for the code! https://en.wikipedia.org/wiki/Otsu%27s_method
  var sum = 0;
  for (var i = 1; i < 256; ++i)
      sum += i * histo[i];
  var sumB = 0;
  var wB = 0;
  var wF = 0;
  var mB;
  var mF;
  var max = 0.0;
  var between = 0.0;
  var threshold1 = 0.0;
  var threshold2 = 0.0;
  for (var i = 0; i < 256; ++i) {
    wB += histo[i]; // Weight background
      if (wB === 0)
          continue;
      wF = pixels - wB; // Weight foreground
      if (wF === 0)
          break;
      sumB += i * histo[i];
      mB = sumB / wB; // Mean background
      mF = (sum - sumB) / wF; // Mean foreground
      between = wB * wF * (mB - mF) * (mB - mF); // Between-class variance
      if ( between >= max ) {
          threshold1 = i;
          if ( between > max ) {
            threshold2 = i;
          }
          max = between;            
      }
  }
  var threshold = ( threshold1 + threshold2 ) / 2.0 / 255; // This division returns the threshold back to the original NDVI values

  print(threshold);
}

// Add layers for display, if you want
Map.addLayer(oneBand, {min:0.2,max:0.8});
Map.addLayer(oneBand.where(oneBand.lte(0.6118),1).where(oneBand.gt(0.6118),0));
