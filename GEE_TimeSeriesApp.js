var aoi = ee.Geometry.Polygon([[[113.800, 22.570],[113.800, 22.120],[114.514, 22.120],[114.514, 22.570]]]);

var Chla = ee.ImageCollection('users/khoyinivan/S2_Chla_ANN');
var vis = {palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'],
    min: 0.2, max: 30.0};

var SS = ee.ImageCollection('users/khoyinivan/S2_SS_ANN');
var Tur = ee.ImageCollection('users/khoyinivan/S2_Tur_ANN');

var utils = require('users/gena/packages:utils');
var text = require('users/gena/packages:text');

Map.centerObject(aoi, 11);
var bounds = aoi.bounds();

//make the data 8-bit which is necessary for making a video
var Chla_video =  Chla.map(function(image){
  var label = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd');
  return image.visualize({
    forceRgbOutput: true,
    palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'],
    min: 0.2, max: 30.0
  }).set({label: label});
});

// annotate
var annotations = [{position: 'left', offset: '1%', margin: '1%', property: 'label', scale: Map.getScale() * 5}];

Chla_video = Chla_video.map(function(image) {
  return text.annotateImage(image, {}, bounds, annotations);
});

var Chla_list = Chla_video.toList(Chla_video.size());


/*
 * Map layer configuration
 */

// Create the main map
var mapPanel = ui.Map();


/*
 * Panel setup
 */

// Create a panel to hold title, intro text, chart and legend components.
var inspectorPanel = ui.Panel({style: {width: '30%'}});

// Create an intro panel with labels.
var intro = ui.Panel([
  ui.Label({
    value: 'Marine Water Quality Inspector - Time Series Estimated From Satellite Image (2015-2021)',
    style: {fontSize: '20px', fontWeight: 'bold'}
  }),
  ui.Label('Refresh the browser if the charts cannot be shown.'),
  ui.Label('Background of this app can be found in:'),
  ui.Label('https://github.com/ivanhykwong/Marine-Water-Quality-Time-Series-HK').setUrl('https://github.com/ivanhykwong/Marine-Water-Quality-Time-Series-HK'),
  ui.Label('Click a location to see its time series of Chlorophyll-a (μg/L).')
]);
inspectorPanel.add(intro);

// Create panels to hold lon/lat values.
var lon = ui.Label();
var lat = ui.Label();
inspectorPanel.add(ui.Panel([lon, lat], ui.Panel.Layout.flow('horizontal')));

// Add placeholders for the chart and legend.
inspectorPanel.add(ui.Label('[Chart]'));
inspectorPanel.add(ui.Label('[Legend]'));
inspectorPanel.add(ui.Label('Click a location to see its time series of other indicators.'));
inspectorPanel.add(ui.Label('[Chart-SS]'));
inspectorPanel.add(ui.Label('[Chart-TUR]'));


/*
 * Chart setup
 */

// Generates a new time series chart of SST for the given coordinates.
var generateChart = function (coords) {
  // Update the lon/lat panel with values from the click event.
  lon.setValue('lon: ' + coords.lon.toFixed(2));
  lat.setValue('lat: ' + coords.lat.toFixed(2));

  // Add a dot for the point clicked on.
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var dot = ui.Map.Layer(point, {color: '000000'}, 'clicked location');
  // Add the dot as the second layer, so it shows up on top of the composite.
  mapPanel.layers().set(1, dot);

  // Make a chart from the time series.
  var sstChart = ui.Chart.image.series(Chla, point, ee.Reducer.mean(), 50);
  
  // Customize the chart.
  sstChart.setOptions({
    title: 'Chlorophyll-a: time series',
    titleTextStyle: {fontSize: 16},
    vAxis: {title: 'Chlorophyll-a (μg/L)'}, //, viewWindow: { min: 0, max: 30 }
    hAxis: {title: 'Date', format: 'MM-yyyy', gridlines: {count: 7}},
    pointSize: 5,
    legend: {position: 'none'}
  });
  // Add the chart at a fixed position, so that new charts overwrite older ones.
  inspectorPanel.widgets().set(2, sstChart);
};


/*
 * Legend setup
 */

// Creates a color bar thumbnail image for use in legend from the given color
// palette.
function makeColorBarParams(palette) {
  return {
    bbox: [0, 0, 1, 0.1],
    dimensions: '100x10',
    format: 'png',
    min: 0,
    max: 1,
    palette: palette,
  };
}

// Create the color bar for the legend.
var colorBar = ui.Thumbnail({
  image: ee.Image.pixelLonLat().select(0),
  params: makeColorBarParams(vis.palette),
  style: {stretch: 'horizontal', margin: '0px 8px', maxHeight: '24px'},
});

// Create a panel with three numbers for the legend.
var legendLabels = ui.Panel({
  widgets: [
    ui.Label(vis.min, {margin: '4px 8px'}),
    ui.Label(
        (vis.max / 2),
        {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
    ui.Label(vis.max, {margin: '4px 8px'})
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});

var legendTitle = ui.Label({
  value: 'Map Legend: Chlorophyll-a (μg/L)',
  style: {fontWeight: 'bold'}
});

var legendPanel = ui.Panel([legendTitle, colorBar, legendLabels]);
inspectorPanel.widgets().set(3, legendPanel);


// Generates a new time series chart of SST for the given coordinates.
var generateChart_SS = function (coords) {

  // Add a dot for the point clicked on.
  var point = ee.Geometry.Point(coords.lon, coords.lat);

  // Make a chart from the time series.
  var sstChart = ui.Chart.image.series(SS, point, ee.Reducer.mean(), 50);

  // Customize the chart.
  sstChart.setOptions({
    title: 'Suspended Solids: time series',
    titleTextStyle: {fontSize: 16},
    vAxis: {title: 'Suspended Solids (mg/L)'}, //,viewWindow: { min: 0, max: 30 }
    hAxis: {title: 'Date', format: 'MM-yyyy', gridlines: {count: 7}},
    pointSize: 5,
    legend: {position: 'none'}
  });
  // Add the chart at a fixed position, so that new charts overwrite older ones.
  inspectorPanel.widgets().set(5, sstChart);
};


// Generates a new time series chart of SST for the given coordinates.
var generateChart_TUR = function (coords) {

  // Add a dot for the point clicked on.
  var point = ee.Geometry.Point(coords.lon, coords.lat);

  // Make a chart from the time series.
  var sstChart = ui.Chart.image.series(Tur, point, ee.Reducer.mean(), 50);

  // Customize the chart.
  sstChart.setOptions({
    title: 'Turbidity: time series',
    titleTextStyle: {fontSize: 16},
    vAxis: {title: 'Turbidity (NTU)'}, //, viewWindow: { min: 0, max: 25 }
    hAxis: {title: 'Date', format: 'MM-yyyy', gridlines: {count: 7}},
    pointSize: 5,
    legend: {position: 'none'}
  });
  // Add the chart at a fixed position, so that new charts overwrite older ones.
  inspectorPanel.widgets().set(6, sstChart);
};


/*
 * Map setup
 */


// Create a panel that contains both the slider and the label.
var uilabel = ui.Label('Chlorophyll-a time series (1=earliest)');
var DateSlider = ui.Slider({min: 1, max: 120, step: 1,
  style: {stretch: 'horizontal', width:'500px', fontWeight: 'bold'},
  onChange: (function(value) {
    mapPanel.layers().reset();
    mapPanel.layers().add(ee.Image(Chla_list.get(value - 1)), 'Chl-a');
  })
});
DateSlider.setValue(120);  // Set a default value.
mapPanel.layers().add(ee.Image(Chla_list.get(0)), 'Chl-a');

var uipanel = ui.Panel({
  widgets: [uilabel, DateSlider],
  layout: ui.Panel.Layout.flow('horizontal')
});

// Add the panel to the map.
mapPanel.add(uipanel);


// Register a callback on the default map to be invoked when the map is clicked.
mapPanel.onClick(generateChart);
mapPanel.onClick(generateChart_SS);
mapPanel.onClick(generateChart_TUR);


// Configure the map.
mapPanel.style().set('cursor', 'crosshair');

// Initialize with a test point.
var initialPoint = ee.Geometry.Point(114.10, 22.30);
mapPanel.centerObject(aoi, 11);

/*
 * Initialize the app
 */

// Replace the root with a SplitPanel that contains the inspector and map.
ui.root.clear();
ui.root.add(ui.SplitPanel(inspectorPanel, mapPanel));

generateChart({
  lon: initialPoint.coordinates().get(0).getInfo(),
  lat: initialPoint.coordinates().get(1).getInfo()
});
generateChart_SS({
  lon: initialPoint.coordinates().get(0).getInfo(),
  lat: initialPoint.coordinates().get(1).getInfo()
});
generateChart_TUR({
  lon: initialPoint.coordinates().get(0).getInfo(),
  lat: initialPoint.coordinates().get(1).getInfo()
});

