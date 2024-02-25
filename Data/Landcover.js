// Obtain LULC for each year of the study by changing the filter date
// Load the MODIS land cover dataset
var modisLandcover = ee.ImageCollection("MODIS/006/MCD12Q1");

// Define the region of interest (Uasin Gishu County)
var counties = ee.FeatureCollection('FAO/GAUL/2015/level2')
  .filter(ee.Filter.eq('ADM2_NAME', 'Uasin Gishu'));

// Print the geometry to the console
print('Uasin Gishu County Geometry:', counties.geometry());

// Add the boundaries to the map
Map.centerObject(counties, 10);
Map.addLayer(counties, {color: 'FF0000'}, 'Uasin Gishu County Boundaries');

// Filter the dataset for the year of interest
var yearOfInterest = 2008;
var filteredLandcover = modisLandcover.filterDate(yearOfInterest + '-01-01', yearOfInterest + '-12-31');

// Select the land cover band (LC_Type1) from the filtered dataset
var landcoverBand = filteredLandcover.select('LC_Type1').first();

// Clip the land cover data to the region of interest
var clippedLandcover = landcoverBand.clip(counties);

// Visualization parameters
var landcoverVisParams = {
  min: 1,
  max: 7,
  palette: [
    '05450a', // Class 1
    '54a708', // Class 2
    '009900', // Class 3
    'c6b044', // Class 4
    'fbff13', // Class 5
    '27ff87', // Class 6
    'c24f44'  // Class 7
  ]
};

// Add the land cover layer to the map
Map.addLayer(clippedLandcover, landcoverVisParams, 'Land Cover');

Export.image.toDrive({
  image: clippedLandcover,
  description: 'land_cover_export',
  region: counties.geometry(),
  scale: 500, // Adjust the scale as needed
  maxPixels: 1e13 // Adjust as needed
});

