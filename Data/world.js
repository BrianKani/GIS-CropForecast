
var export_oneimage = function(img, folder, name, region, scale, crs) {
  var task = ee.batch.Export.image.toDrive({
    image: img,
    description: name,
    folder: folder,
    fileNamePrefix: name,
    region: region,
    scale: scale,
    crs: crs
  });

  task.start();

  while (task.status().state === 'RUNNING') {
    print('Running...');
    // Perhaps task.cancel() at some point.
    // Sleep for 10 seconds
    Utilities.sleep(10000);
  }

  print('Done.', task.status());
};

var locations = ee.FeatureCollection('users/yourUsername/path/to/world_locations');
var world_region = ee.FeatureCollection('ft:1tdSwUL7MVpOauSgRzqVTOwdfy17KDbw-1d9omPw');

var imgcoll = ee.ImageCollection('MODIS/MOD09A1')
    .filterBounds(ee.Geometry.Rectangle(-106.5, 50, -64, 23))
    .filterDate('2014-12-31', '2020-12-31');
var img = imgcoll.min().max(0).clip(world_region.geometry());

locations.getInfo().features.forEach(function(location) {
  var country = location.properties.Country;
  var index = location.properties.Index;
  var fname = 'index' + index;

  var scale = 500;
  var crs = 'EPSG:4326';

  // Filter for a country
  var region = world_region.filterMetadata('Country', 'equals', country);
  if (region.isEmpty().getInfo()) {
    print(country, index, 'not found');
    return;
  }
  region = region.first().geometry();

  // Export the image
  export_oneimage(img, 'Data_world', fname, region, scale, crs);
});

