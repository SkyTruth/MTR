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
/*------------------------------ Import Greenest Pixel Composites ------------------------*/
var L8_14 = ee.Image(ee.ImageCollection('LANDSAT/LC8_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2014-01-01', '2014-12-31')
  .mean()
  .toFloat());
var L8_13 = ee.Image(ee.ImageCollection('LANDSAT/LC8_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2013-01-01', '2013-12-31')
  .mean()
  .toFloat());
var L7_12 = ee.Image(ee.ImageCollection('LANDSAT/LE7_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2012-01-01', '2012-12-31')
  .first());
var L5_11 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2011-01-01', '2011-12-31')
  .first());
var L5_10 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2010-01-01', '2010-12-31')
  .first());
var L5_09 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2009-01-01', '2009-12-31')
  .first());
var L5_08 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2008-01-01', '2008-12-31')
  .first());
var L5_07 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2007-01-01', '2007-12-31')
  .first());  
var L5_06 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2006-01-01', '2006-12-31')
  .first());
var L5_05 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2005-01-01', '2005-12-31')
  .first());
var L5_04 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2004-01-01', '2004-12-31')
  .first());
var L5_03 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2003-01-01', '2003-12-31')
  .first());
var L5_02 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2002-01-01', '2002-12-31')
  .first());
var L5_01 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2001-01-01', '2001-12-31')
  .first());
var L5_2000 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('2000-01-01', '2000-12-31')
  .first());
var L5_99 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1999-01-01', '1999-12-31')
  .first());
var L5_98 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1998-01-01', '1998-12-31')
  .first());
var L5_97 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1997-01-01', '1997-12-31')
  .first());
var L5_96 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1996-01-01', '1996-12-31')
  .first());
var L5_95 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1995-01-01', '1995-12-31')
  .first());
var L5_94 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1994-01-01', '1994-12-31')
  .first());
var L5_93 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1993-01-01', '1993-12-31')
  .first());
var L5_92 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1992-01-01', '1992-12-31')
  .first());
var L5_91 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1991-01-01', '1991-12-31')
  .first());
var L5_90 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1990-01-01', '1990-12-31')
  .first());
var L5_89 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1989-01-01', '1989-12-31')
  .first());
var L5_88 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1988-01-01', '1988-12-31')
  .first());
var L5_87 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1987-01-01', '1987-12-31')
  .first());
var L5_86 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1986-01-01', '1986-12-31')
  .first());
var L5_85 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1985-01-01', '1985-12-31')
  .first());
var L5_84 = ee.Image(ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_GREENEST_TOA')
  .filterDate('1984-01-01', '1984-12-31')
  .first());
/* -------------------------- CALCULATE NDVI --------------------------------------------*/
var ndvi_2014 = L8_14.expression('(Band5 - Band4) / (Band5 + Band4)', { Band5: L8_14.select('B5'), Band4: L8_14.select('B4')});
var ndvi_2013 = L8_13.expression('(Band5 - Band4) / (Band5 + Band4)', { Band5: L8_13.select('B5'), Band4: L8_13.select('B4')});
var ndvi_2012 = L7_12.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L7_12.select('B4'), Band3: L7_12.select('B3')});
var ndvi_2011 = L5_11.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_11.select('B4'), Band3: L5_11.select('B3')});
var ndvi_2010 = L5_10.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_10.select('B4'), Band3: L5_10.select('B3')});
var ndvi_2009 = L5_09.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_09.select('B4'), Band3: L5_09.select('B3')});
var ndvi_2008 = L5_08.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_08.select('B4'), Band3: L5_08.select('B3')});
var ndvi_2007 = L5_07.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_07.select('B4'), Band3: L5_07.select('B3')});
var ndvi_2006 = L5_06.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_06.select('B4'), Band3: L5_06.select('B3')});
var ndvi_2005 = L5_05.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_05.select('B4'), Band3: L5_05.select('B3')});
var ndvi_2004 = L5_04.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_04.select('B4'), Band3: L5_04.select('B3')});
var ndvi_2003 = L5_03.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_03.select('B4'), Band3: L5_03.select('B3')});
var ndvi_2002 = L5_02.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_02.select('B4'), Band3: L5_02.select('B3')});
var ndvi_2001 = L5_01.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_01.select('B4'), Band3: L5_01.select('B3')});
var ndvi_2000 = L5_2000.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_2000.select('B4'), Band3: L5_2000.select('B3')});
var ndvi_1999 = L5_99.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_99.select('B4'), Band3: L5_99.select('B3')});
var ndvi_1998 = L5_98.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_98.select('B4'), Band3: L5_98.select('B3')});
var ndvi_1997 = L5_97.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_97.select('B4'), Band3: L5_97.select('B3')});
var ndvi_1996 = L5_96.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_96.select('B4'), Band3: L5_96.select('B3')});
var ndvi_1995 = L5_95.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_95.select('B4'), Band3: L5_95.select('B3')});
var ndvi_1994 = L5_94.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_94.select('B4'), Band3: L5_94.select('B3')});
var ndvi_1993 = L5_93.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_93.select('B4'), Band3: L5_93.select('B3')});
var ndvi_1992 = L5_92.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_92.select('B4'), Band3: L5_92.select('B3')});
var ndvi_1991 = L5_91.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_91.select('B4'), Band3: L5_91.select('B3')});
var ndvi_1990 = L5_90.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_90.select('B4'), Band3: L5_90.select('B3')});
var ndvi_1989 = L5_89.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_89.select('B4'), Band3: L5_89.select('B3')});
var ndvi_1988 = L5_88.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_88.select('B4'), Band3: L5_88.select('B3')});
var ndvi_1987 = L5_87.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_87.select('B4'), Band3: L5_87.select('B3')});
var ndvi_1986 = L5_86.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_86.select('B4'), Band3: L5_86.select('B3')});
var ndvi_1985 = L5_85.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_85.select('B4'), Band3: L5_85.select('B3')});
var ndvi_1984 = L5_84.expression('(Band4 - Band3) / (Band4 + Band3)', { Band4: L5_84.select('B4'), Band3: L5_84.select('B3')});
/* ----------------------------------------- MASK ----------------------------------------------
Applies a value of 1 to locations where the NDVI values fall below the previously set threshold. */
var blank = ee.Image(0);
var LowNDVI_2014 = blank.where(ndvi_2014.lte(NDVI_Threshold),1);
var LowNDVI_2013 = blank.where(ndvi_2013.lte(NDVI_Threshold),1);
var LowNDVI_2012 = blank.where(ndvi_2012.lte(NDVI_Threshold),1);
var LowNDVI_2011 = blank.where(ndvi_2011.lte(NDVI_Threshold),1);
var LowNDVI_2010 = blank.where(ndvi_2010.lte(NDVI_Threshold),1);
var LowNDVI_2009 = blank.where(ndvi_2009.lte(NDVI_Threshold),1);
var LowNDVI_2008 = blank.where(ndvi_2008.lte(NDVI_Threshold),1);
var LowNDVI_2007 = blank.where(ndvi_2007.lte(NDVI_Threshold),1);
var LowNDVI_2006 = blank.where(ndvi_2006.lte(NDVI_Threshold),1);
var LowNDVI_2005 = blank.where(ndvi_2005.lte(NDVI_Threshold),1);
var LowNDVI_2004 = blank.where(ndvi_2004.lte(NDVI_Threshold),1);
var LowNDVI_2003 = blank.where(ndvi_2003.lte(NDVI_Threshold),1);
var LowNDVI_2002 = blank.where(ndvi_2002.lte(NDVI_Threshold),1);
var LowNDVI_2001 = blank.where(ndvi_2002.lte(NDVI_Threshold),1);
var LowNDVI_2000 = blank.where(ndvi_2000.lte(NDVI_Threshold),1);
var LowNDVI_1999 = blank.where(ndvi_1999.lte(NDVI_Threshold),1);
var LowNDVI_1998 = blank.where(ndvi_1998.lte(NDVI_Threshold),1);
var LowNDVI_1997 = blank.where(ndvi_1997.lte(NDVI_Threshold),1);
var LowNDVI_1996 = blank.where(ndvi_1996.lte(NDVI_Threshold),1);
var LowNDVI_1995 = blank.where(ndvi_1995.lte(NDVI_Threshold),1);
var LowNDVI_1994 = blank.where(ndvi_1994.lte(NDVI_Threshold),1);
var LowNDVI_1993 = blank.where(ndvi_1993.lte(NDVI_Threshold),1);
var LowNDVI_1992 = blank.where(ndvi_1992.lte(NDVI_Threshold),1);
var LowNDVI_1991 = blank.where(ndvi_1991.lte(NDVI_Threshold),1);
var LowNDVI_1990 = blank.where(ndvi_1990.lte(NDVI_Threshold),1);
var LowNDVI_1989 = blank.where(ndvi_1989.lte(NDVI_Threshold),1);
var LowNDVI_1988 = blank.where(ndvi_1988.lte(NDVI_Threshold),1);
var LowNDVI_1987 = blank.where(ndvi_1987.lte(NDVI_Threshold),1);
var LowNDVI_1986 = blank.where(ndvi_1986.lte(NDVI_Threshold),1);
var LowNDVI_1985 = blank.where(ndvi_1985.lte(NDVI_Threshold),1);
var LowNDVI_1984 = blank.where(ndvi_1984.lte(NDVI_Threshold),1);
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

// Create binary image containing the intersection between the LowNDVI and anywhere the inverted mask is 1.
var MTR_2014 = LowNDVI_2014.and(mask_inverted_60m);
var MTR_2013 = LowNDVI_2013.and(mask_inverted_60m);
var MTR_2012 = LowNDVI_2012.and(mask_inverted_60m);
var MTR_2011 = LowNDVI_2011.and(mask_inverted_60m);
var MTR_2010 = LowNDVI_2010.and(mask_inverted_60m);
var MTR_2009 = LowNDVI_2009.and(mask_inverted_60m);
var MTR_2008 = LowNDVI_2008.and(mask_inverted_60m);
var MTR_2007 = LowNDVI_2007.and(mask_inverted_60m);
var MTR_2006 = LowNDVI_2006.and(mask_inverted_60m);
var MTR_2005 = LowNDVI_2005.and(mask_inverted_60m);
var MTR_2004 = LowNDVI_2004.and(mask_inverted_60m);
var MTR_2003 = LowNDVI_2003.and(mask_inverted_60m);
var MTR_2002 = LowNDVI_2002.and(mask_inverted_60m);
var MTR_2001 = LowNDVI_2001.and(mask_inverted_60m);
var MTR_2000 = LowNDVI_2000.and(mask_inverted_60m);
var MTR_1999 = LowNDVI_1999.and(mask_inverted_60m);
var MTR_1998 = LowNDVI_1998.and(mask_inverted_60m);
var MTR_1997 = LowNDVI_1997.and(mask_inverted_60m);
var MTR_1996 = LowNDVI_1996.and(mask_inverted_60m);
var MTR_1995 = LowNDVI_1995.and(mask_inverted_60m);
var MTR_1994 = LowNDVI_1994.and(mask_inverted_60m);
var MTR_1993 = LowNDVI_1993.and(mask_inverted_60m);
var MTR_1992 = LowNDVI_1992.and(mask_inverted_60m);
var MTR_1991 = LowNDVI_1991.and(mask_inverted_60m);
var MTR_1990 = LowNDVI_1990.and(mask_inverted_60m);
var MTR_1989 = LowNDVI_1989.and(mask_inverted_60m);
var MTR_1988 = LowNDVI_1988.and(mask_inverted_60m);
var MTR_1987 = LowNDVI_1987.and(mask_inverted_60m);
var MTR_1986 = LowNDVI_1986.and(mask_inverted_60m);
var MTR_1985 = LowNDVI_1985.and(mask_inverted_60m);
var MTR_1984 = LowNDVI_1984.and(mask_inverted_60m); 

// MTR layers clipped to the extent of the Campagna Study Area
var MTR_2014_clipped = MTR_2014.clip(campagna_study_area);
var MTR_2013_clipped = MTR_2013.clip(campagna_study_area);
var MTR_2007_clipped = MTR_2007.clip(campagna_study_area);
var MTR_2006_clipped = MTR_2006.clip(campagna_study_area);
var MTR_1997_clipped = MTR_1997.clip(campagna_study_area);
var MTR_1996_clipped = MTR_1996.clip(campagna_study_area);
var MTR_1987_clipped = MTR_1987.clip(campagna_study_area);
var MTR_1986_clipped = MTR_1986.clip(campagna_study_area);
//Centers map and sets zoom for this API display
Map.setCenter(-81.58,37.92,11);
Map.addLayer(campagna_study_area);

// DISPLAY ERODE/DILATE MTR Sites to remove outliers (pixel clean-up)
// 2014
var blank_mask = ee.Image(0);
var MTR_2014_invert = blank_mask.where(MTR_2014_clipped.eq(0),1).where(MTR_2014_clipped.eq(1),0);
var MTR_2014_invert_buffer = MTR_2014_invert.distance(ee.Kernel.euclidean(30,'meters')).where(MTR_2014_invert.eq(0),1).where(MTR_2014_invert.eq(1),0);
var MTR_2014_in30 = MTR_2014_clipped.subtract(MTR_2014_invert_buffer);
var final_2014_invert = blank_mask.where(MTR_2014_in30.eq(0),0).where(MTR_2014_in30.gte(0),1);
var MTR_2014_buffered_in = blank_mask.where(final_2014_invert.eq(0),1).where(final_2014_invert.eq(1),0);
var buffer_2014_out = MTR_2014_buffered_in.distance(ee.Kernel.euclidean(30,'meters'));
var buffer_2014_out_2 = buffer_2014_out.where(MTR_2014_in30.eq(0),0).where(MTR_2014_in30.gte(0),1);
var final_2014_buffer_out = MTR_2014_buffered_in.clip(campagna_study_area).add(buffer_2014_out_2);

Map.addLayer(final_2014_buffer_out.sldStyle(sld_intervals1), {min:0, max:1}, 'MTR 2014 Final');
// 2013
var MTR_2013_invert = blank_mask.where(MTR_2013_clipped.eq(0),1).where(MTR_2013_clipped.eq(1),0);
var MTR_2013_invert_buffer = MTR_2013_invert.distance(ee.Kernel.euclidean(30,'meters')).where(MTR_2013_invert.eq(0),1).where(MTR_2013_invert.eq(1),0);
var MTR_2013_in30 = MTR_2013_clipped.subtract(MTR_2013_invert_buffer);
var final_2013_invert = blank_mask.where(MTR_2013_in30.eq(0),0).where(MTR_2013_in30.gte(0),1);
var MTR_2013_buffered_in = blank_mask.where(final_2013_invert.eq(0),1).where(final_2013_invert.eq(1),0);
var buffer_2013_out = MTR_2013_buffered_in.distance(ee.Kernel.euclidean(30,'meters'));
var buffer_2013_out_2 = buffer_2013_out.where(MTR_2013_in30.eq(0),0).where(MTR_2013_in30.gte(0),1);
var final_2013_buffer_out = MTR_2013_buffered_in.clip(campagna_study_area).add(buffer_2013_out_2);

Map.addLayer(final_2013_buffer_out.sldStyle(sld_intervals1), {min:0, max:1}, 'MTR 2013 Final');
// 2007
var MTR_2007_invert = blank_mask.where(MTR_2007_clipped.eq(0),1).where(MTR_2007_clipped.eq(1),0);
var MTR_2007_invert_buffer = MTR_2007_invert.distance(ee.Kernel.euclidean(30,'meters')).where(MTR_2007_invert.eq(0),1).where(MTR_2007_invert.eq(1),0);
var MTR_2007_in30 = MTR_2007_clipped.subtract(MTR_2007_invert_buffer);
var final_2007_invert = blank_mask.where(MTR_2007_in30.eq(0),0).where(MTR_2007_in30.gte(0),1);
var MTR_2007_buffered_in = blank_mask.where(final_2007_invert.eq(0),1).where(final_2007_invert.eq(1),0);
var buffer_2007_out = MTR_2007_buffered_in.distance(ee.Kernel.euclidean(30,'meters'));
var buffer_2007_out_2 = buffer_2007_out.where(MTR_2007_in30.eq(0),0).where(MTR_2007_in30.gte(0),1);
var final_2007_buffer_out = MTR_2007_buffered_in.clip(campagna_study_area).add(buffer_2007_out_2);

Map.addLayer(final_2007_buffer_out.sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2007 Final');
// 2006
var MTR_2006_invert = blank_mask.where(MTR_2006_clipped.eq(0),1).where(MTR_2006_clipped.eq(1),0);
var MTR_2006_invert_buffer = MTR_2006_invert.distance(ee.Kernel.euclidean(30,'meters')).where(MTR_2006_invert.eq(0),1).where(MTR_2006_invert.eq(1),0);
var MTR_2006_in30 = MTR_2006_clipped.subtract(MTR_2006_invert_buffer);
var final_2006_invert = blank_mask.where(MTR_2006_in30.eq(0),0).where(MTR_2006_in30.gte(0),1);
var MTR_2006_buffered_in = blank_mask.where(final_2006_invert.eq(0),1).where(final_2006_invert.eq(1),0);
var buffer_2006_out = MTR_2006_buffered_in.distance(ee.Kernel.euclidean(30,'meters'));
var buffer_2006_out_2 = buffer_2006_out.where(MTR_2006_in30.eq(0),0).where(MTR_2006_in30.gte(0),1);
var final_2006_buffer_out = MTR_2006_buffered_in.clip(campagna_study_area).add(buffer_2006_out_2);

Map.addLayer(final_2006_buffer_out.sldStyle(sld_intervals2), {min:0, max:1}, 'MTR 2006 Final');
// 1997
var MTR_1997_invert = blank_mask.where(MTR_1997_clipped.eq(0),1).where(MTR_1997_clipped.eq(1),0);
var MTR_1997_invert_buffer = MTR_1997_invert.distance(ee.Kernel.euclidean(30,'meters')).where(MTR_1997_invert.eq(0),1).where(MTR_1997_invert.eq(1),0);
var MTR_1997_in30 = MTR_1997_clipped.subtract(MTR_1997_invert_buffer);
var final_1997_invert = blank_mask.where(MTR_1997_in30.eq(0),0).where(MTR_1997_in30.gte(0),1);
var MTR_1997_buffered_in = blank_mask.where(final_1997_invert.eq(0),1).where(final_1997_invert.eq(1),0);
var buffer_1997_out = MTR_1997_buffered_in.distance(ee.Kernel.euclidean(30,'meters'));
var buffer_1997_out_2 = buffer_1997_out.where(MTR_1997_in30.eq(0),0).where(MTR_1997_in30.gte(0),1);
var final_1997_buffer_out = MTR_1997_buffered_in.clip(campagna_study_area).add(buffer_1997_out_2);

Map.addLayer(final_1997_buffer_out.sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1997 Final');
// 1996
var MTR_1996_invert = blank_mask.where(MTR_1996_clipped.eq(0),1).where(MTR_1996_clipped.eq(1),0);
var MTR_1996_invert_buffer = MTR_1996_invert.distance(ee.Kernel.euclidean(30,'meters')).where(MTR_1996_invert.eq(0),1).where(MTR_1996_invert.eq(1),0);
var MTR_1996_in30 = MTR_1996_clipped.subtract(MTR_1996_invert_buffer);
var final_1996_invert = blank_mask.where(MTR_1996_in30.eq(0),0).where(MTR_1996_in30.gte(0),1);
var MTR_1996_buffered_in = blank_mask.where(final_1996_invert.eq(0),1).where(final_1996_invert.eq(1),0);
var buffer_1996_out = MTR_1996_buffered_in.distance(ee.Kernel.euclidean(30,'meters'));
var buffer_1996_out_2 = buffer_1996_out.where(MTR_1996_in30.eq(0),0).where(MTR_1996_in30.gte(0),1);
var final_1996_buffer_out = MTR_1996_buffered_in.clip(campagna_study_area).add(buffer_1996_out_2);

Map.addLayer(final_1996_buffer_out.sldStyle(sld_intervals3), {min:0, max:1}, 'MTR 1996 Final');
// 1987
var MTR_1987_invert = blank_mask.where(MTR_1987_clipped.eq(0),1).where(MTR_1987_clipped.eq(1),0);
var MTR_1987_invert_buffer = MTR_1987_invert.distance(ee.Kernel.euclidean(30,'meters')).where(MTR_1987_invert.eq(0),1).where(MTR_1987_invert.eq(1),0);
var MTR_1987_in30 = MTR_1987_clipped.subtract(MTR_1987_invert_buffer);
var final_1987_invert = blank_mask.where(MTR_1987_in30.eq(0),0).where(MTR_1987_in30.gte(0),1);
var MTR_1987_buffered_in = blank_mask.where(final_1987_invert.eq(0),1).where(final_1987_invert.eq(1),0);
var buffer_1987_out = MTR_1987_buffered_in.distance(ee.Kernel.euclidean(30,'meters'));
var buffer_1987_out_2 = buffer_1987_out.where(MTR_1987_in30.eq(0),0).where(MTR_1987_in30.gte(0),1);
var final_1987_buffer_out = MTR_1987_buffered_in.clip(campagna_study_area).add(buffer_1987_out_2);

Map.addLayer(final_1987_buffer_out.sldStyle(sld_intervals4), {min:0, max:1}, 'MTR 1987 Final');
// 1986
var MTR_1986_invert = blank_mask.where(MTR_1986_clipped.eq(0),1).where(MTR_1986_clipped.eq(1),0);
var MTR_1986_invert_buffer = MTR_1986_invert.distance(ee.Kernel.euclidean(30,'meters')).where(MTR_1986_invert.eq(0),1).where(MTR_1986_invert.eq(1),0);
var MTR_1986_in30 = MTR_1986_clipped.subtract(MTR_1986_invert_buffer);
var final_1986_invert = blank_mask.where(MTR_1986_in30.eq(0),0).where(MTR_1986_in30.gte(0),1);
var MTR_1986_buffered_in = blank_mask.where(final_1986_invert.eq(0),1).where(final_1986_invert.eq(1),0);
var buffer_1986_out = MTR_1986_buffered_in.distance(ee.Kernel.euclidean(30,'meters'));
var buffer_1986_out_2 = buffer_1986_out.where(MTR_1986_in30.eq(0),0).where(MTR_1986_in30.gte(0),1);
var final_1986_buffer_out = MTR_1986_buffered_in.clip(campagna_study_area).add(buffer_1986_out_2);

Map.addLayer(final_1986_buffer_out.sldStyle(sld_intervals4), {min:0, max:1}, 'MTR 1986 Final');



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
*/
/* ------------------- Total Reclaimed Mine Classification: -------------------
 Areas which are classified as mine land in earlier image but not later image, are now
 classified as reclaimed mine land.
      Early Date - Later Date */
//var reclaimed = MTR_1984.subtract(MTR_2014);
//Map.addLayer(reclaimed.sldStyle(sld_intervals5), {min:0, max:1}, 'Reclaimed Mine Land');

