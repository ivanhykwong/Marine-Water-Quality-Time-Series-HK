// atmospheric.py, Sam Murphy (2016-10-26)

// Atmospheric water vapour, ozone and AOT from GEE

// Usage
// H2O = Atmospheric.water(geom,date)
// O3 = Atmospheric.ozone(geom,date)
// AOT = Atmospheric.aerosol(geom,date)

function round_date(date,xhour){
  // rounds a date of to the closest 'x' hours
  var y = date.get('year');
  var m = date.get('month');
  var d = date.get('day');
  var H = date.get('hour');
  var HH = H.divide(xhour).round().multiply(xhour);
  return ee.Date.fromYMD(y,m,d).advance(HH,'hour');
}

function round_month(date){
  // round date to closest month
  // start of THIS month
  var m1 = ee.Date.fromYMD(date.get('year'),date.get('month'),ee.Number(1));
  // start of NEXT month
  var m2 = m1.advance(1,'month');
  // difference from date
  var d1 = ee.Number(date.difference(m1,'day')).abs();
  var d2 = ee.Number(date.difference(m2,'day')).abs();
  // return closest start of month
  return ee.Date(ee.Algorithms.If(d2.gt(d1),m1,m2));
}  
  
function water(geom,date){
  // Water vapour column above target at time of image aquisition.
  //  (Kalnay et al., 1996, The NCEP/NCAR 40-Year Reanalysis Project. Bull. 
  //  Amer. Meteor. Soc., 77, 437-471)
  // Point geometry required
  var centroid = geom.centroid();
  // H2O datetime is in 6 hour intervals
  var H2O_date = round_date(date,6);
  // filtered water collection
  var water_ic = ee.ImageCollection('NCEP_RE/surface_wv').filterDate(H2O_date, H2O_date.advance(1,'month'));
  // water image
  var water_img = ee.Image(water_ic.first());
  // water_vapour at target
  var water_target = water_img.reduceRegion({reducer:ee.Reducer.mean(), geometry:centroid}).get('pr_wtr');
  // convert to Py6S units (Google = kg/m^2, Py6S = g/cm^2)
  var water_Py6S_units = ee.Number(water_target).divide(10);
  return water_Py6S_units;
}  
  
  
function ozone(geom,date){
  // returns ozone measurement from merged TOMS/OMI dataset
  // OR
  // uses our fill value (which is mean value for that latlon and day-of-year)
  // Point geometry required
  var centroid = geom.centroid();
  
  function ozone_fill(centroid,O3_date){
    //  Gets our ozone fill value (i.e. mean value for that doy and latlon)
    //  you can see it
    //  1) compared to LEDAPS: https://code.earthengine.google.com/8e62a5a66e4920e701813e43c0ecb83e
    //  2) as a video: https://www.youtube.com/watch?v=rgqwvMRVguI&feature=youtu.be
      
    // ozone fills (i.e. one band per doy)
    var ozone_fills = ee.ImageCollection('users/samsammurphy/public/ozone_fill').toList(366);
    // day of year index
    var jan01 = ee.Date.fromYMD(O3_date.get('year'),1,1);
    var doy_index = date.difference(jan01,'day').toInt(); // (NB. index is one less than doy, so no need to +1)
    //  day of year image
    var fill_image = ee.Image(ozone_fills.get(doy_index));
    // return scalar fill value
    return fill_image.reduceRegion({reducer:ee.Reducer.mean(), geometry:centroid}).get('ozone');
  }
  
  function ozone_measurement(centroid,O3_date){
    // filtered ozone collection
    var ozone_ic = ee.ImageCollection('TOMS/MERGED').filterDate(O3_date, O3_date.advance(1,'month'));
    // ozone image
    var ozone_img = ee.Image(ozone_ic.first());
    // ozone value IF TOMS/OMI image exists ELSE use fill value
    var ozone_target = ee.Algorithms.If(ozone_img, ozone_img.reduceRegion({reducer:ee.Reducer.mean(), geometry:centroid}).get('ozone'), ozone_fill(centroid,O3_date));
    return ozone_target;
  }

  // O3 datetime in 24 hour intervals
  var O3_date = round_date(date,24);
  // TOMS temporal gap
  var TOMS_gap = ee.DateRange('1994-11-01','1996-08-01');
  // avoid TOMS gap entirely
  var ozone_target = ee.Algorithms.If(TOMS_gap.contains(O3_date),ozone_fill(centroid,O3_date),ozone_measurement(centroid,O3_date));
  // fix other data gaps (e.g. spatial, missing images, etc..)
  ozone_target = ee.Algorithms.If(ozone_target,ozone_target,ozone_fill(centroid,O3_date));
  // convert to Py6S units 
  var ozone_Py6S_units = ee.Number(ozone_target).divide(1000); // (i.e. Dobson units are milli-atm-cm )                             
  return ozone_Py6S_units;
}

function aerosol(geom,date){
  // Aerosol Optical Thickness.
  // try: MODIS Aerosol Product (monthly)
  // except: fill value
    
  function aerosol_fill(date){
    // MODIS AOT fill value for this month (i.e. no data gaps)
    return ee.Image('users/samsammurphy/public/AOT_stack').select([ee.String('AOT_').cat(date.format('M'))]).rename(['AOT_550']);
  }
               
  function aerosol_this_month(date){
    // MODIS AOT original data product for this month (i.e. some data gaps)
    // image for this month
    var img = ee.Image(ee.ImageCollection('MODIS/061/MOD08_M3').filterDate(round_month(date)).first());
      
    // fill missing month (?)
    img = ee.Algorithms.If(img, img.select(['Aerosol_Optical_Depth_Land_Mean_Mean_550']).divide(1000).rename(['AOT_550']), aerosol_fill(date));
    return img;
  }      
  
  function get_AOT(AOT_band,geom){
    // AOT scalar value for target
    return ee.Image(AOT_band).reduceRegion({reducer:ee.Reducer.mean(), geometry:geom.centroid()}).get('AOT_550');
  }
  
  var after_modis_start = date.difference(ee.Date('2000-03-01'),'month').gt(0);
  var AOT_band = ee.Algorithms.If(after_modis_start, aerosol_this_month(date), aerosol_fill(date));
  var AOT = get_AOT(AOT_band,geom);
  AOT = ee.Algorithms.If(AOT,AOT,get_AOT(aerosol_fill(date),geom)); // check reduce region worked (else force fill value)
    
  return AOT;
}


var mainPanel = ui.Panel({style: {width: '40%'}});

// Add the app title to the side panel
var titleLabel = ui.Label('Atmospheric Constituent and Parameters for 6S Atmospheric Correction', {fontSize: '32px'});
mainPanel.add(titleLabel);

// Add the app description to the main panel
var descriptionText =
    'This app allows you to obtain the parameters related to atmospheric constituents required for 6S atmospheric correction, '+
    'including Water Vapour (g/cm^2), Ozone (cm-atm) and Aerosol Optical Thickness. '+
    'Modified from functions created by Sam Murphy.';
mainPanel.add(ui.Label(descriptionText));

var descriptionText2 =
    'Reference: https://github.com/samsammurphy/gee-atmcorr-S2/blob/master/bin/atmospheric.py';
mainPanel.add(ui.Label(descriptionText2, {},
    'https://github.com/samsammurphy/gee-atmcorr-S2/blob/master/bin/atmospheric.py'));

var descriptionText3 =
    'Enter the latitude and longitude of the target location in the following textboxes, or click on the map to obtain the coordinates. '+
    'Then enter the year, month, day and hour in the corresponding textboxes. '+
    'Click "Calculate" to obtain the result.';
mainPanel.add(ui.Label(descriptionText3));

var Lat_textbox = ui.Textbox({placeholder: 'Latitude'}).setValue('0');
mainPanel.add(ui.Panel([ui.Label('Latitude (-90 to 90):'), Lat_textbox], ui.Panel.Layout.flow('horizontal')));

var Lon_textbox = ui.Textbox({placeholder: 'Longitude'}).setValue('0');
mainPanel.add(ui.Panel([ui.Label('Longitude (-180 to 180):'), Lon_textbox], ui.Panel.Layout.flow('horizontal')));

var Year_textbox = ui.Textbox({placeholder: 'Year'}).setValue('2000');
mainPanel.add(ui.Panel([ui.Label('Year:'), Year_textbox], ui.Panel.Layout.flow('horizontal')));

var Month_textbox = ui.Textbox({placeholder: 'Month'}).setValue('01');
mainPanel.add(ui.Panel([ui.Label('Month:'), Month_textbox], ui.Panel.Layout.flow('horizontal')));

var Day_textbox = ui.Textbox({placeholder: 'Day'}).setValue('01');
mainPanel.add(ui.Panel([ui.Label('Day:'), Day_textbox], ui.Panel.Layout.flow('horizontal')));

var Hour_textbox = ui.Textbox({placeholder: 'Hour'}).setValue('00');
mainPanel.add(ui.Panel([ui.Label('Hour:'), Hour_textbox], ui.Panel.Layout.flow('horizontal')));

function compute(){
  var Lat = ee.Number.parse(Lat_textbox.getValue());
  var Lon = ee.Number.parse(Lon_textbox.getValue());
  var Year = ee.String(Year_textbox.getValue());
  var Month = ee.String(Month_textbox.getValue());
  var Day = ee.String(Day_textbox.getValue());
  var Hour = ee.String(Hour_textbox.getValue());
  var Date = Year.cat('-').cat(Month).cat('-').cat(Day).cat('T').cat(Hour).cat(':00:00');
  var geom = ee.Geometry.Point([Lon, Lat]);
  var H2O = water(geom,ee.Date(Date));
  var O3 = ozone(geom,ee.Date(Date));
  var AOT = aerosol(geom,ee.Date(Date));
  Lon_display.setValue('Lon: ' + Lon.getInfo());
  Lat_display.setValue('Lat: ' + Lat.getInfo());
  Date_display.setValue('Date: ' + Date.getInfo());
  H2O_display.setValue('Water Vapour (g/cm^2): ' + H2O.getInfo());
  O3_display.setValue('Ozone (cm-atm): ' + O3.getInfo());
  AOT_display.setValue('Aerosol Optical Thickness: ' + AOT.getInfo());
  mapPanel.centerObject(geom,11);
  var dot = ui.Map.Layer(geom, {color: '000000'}, 'location');
  mapPanel.layers().set(0, dot);
}

var button = ui.Button({
  label: 'Calculate',
  onClick: compute
});
mainPanel.add(button);

var Lon_display = ui.Label();
var Lat_display = ui.Label();
mainPanel.add(ui.Panel([Lon_display, Lat_display], ui.Panel.Layout.flow('horizontal')));
var Date_display = ui.Label();
var H2O_display = ui.Label();
var O3_display = ui.Label();
var AOT_display = ui.Label();
mainPanel.add(Date_display);
mainPanel.add(H2O_display);
mainPanel.add(O3_display);
mainPanel.add(AOT_display);


var mapPanel = ui.Map();
mapPanel.style().set('cursor', 'crosshair');
var clickmap = function (coords) {
  // Update the lon/lat textbox with values from the click event.
  Lat_textbox.setValue(coords.lat.toFixed(2));
  Lon_textbox.setValue(coords.lon.toFixed(2));
};
mapPanel.onClick(clickmap);

mainPanel.add(ui.Label('------------------'));
mainPanel.add(ui.Label('Created by Ivan Kwong, in December 2022'));
mainPanel.add(ui.Label('GitHub page', {},
    'https://github.com/ivanhykwong/Marine-Water-Quality-Time-Series-HK'));

ui.root.clear();
ui.root.add(ui.SplitPanel(mainPanel, mapPanel));
