var modisLandCover = ee.ImageCollection("MODIS/006/MCD12Q1"),
    gfc2014 = ee.Image("UMD/hansen/global_forest_change_2015"),
    countries = ee.FeatureCollection("ft:1tdSwUL7MVpOauSgRzqVTOwdfy17KDbw-1d9omPw"),
    states = ee.FeatureCollection("ft:17aT9Ud-YnGiXdXEJUyycH2ocUqreOeKGbzCkUw"),
    gfc2017 = ee.Image("UMD/hansen/global_forest_change_2017_v1_5");


// Displaying forest, loss, gain, and pixels where both loss and gain occur.

var treeCover = gfc2014.select(['treecover2000']);
var lossImage = gfc2014.select(['loss']);
var gainImage = gfc2014.select(['gain']);
var gainAndLoss = gainImage.and(lossImage);
var landCover = modisLandCover.select(['LC_Type1']);

//for calculating square meters
var areaImageLoss = lossImage.multiply(ee.Image.pixelArea());
var areaImageGain = gainImage.multiply(ee.Image.pixelArea());


print(treeCover);

//trying to figure out calculating forest cover pixels
// Select the forest classes from the MODIS land cover image.

//var elev = ee.Image('srtm90_v4');

//var cover = ee.Image('MCD12Q1/MCD12Q1_005_2001_01_01')

//    .select('Land_Cover_Type_1');


// Create a blank image to receive the output selection.

var blank = ee.Image(0);


// Use comparison methods to select where tree cover is greater than 59

var myOutput = blank.where(treeCover.gte(60), 1);



// Output contains 0s and 1s.  Mask it with itself to get rid of the 0s.

var treeCover2000positive = myOutput.mask(myOutput);
print(treeCover2000positive);


Map.addLayer(treeCover2000positive, {'palette': '00AA00'});

//Map.setCenter(-113.41842, 40.055489, 6);

//end figuring that shit out

var treeCoverPix = treeCover2000positive.multiply(ee.Image.pixelArea());



//Make The Map

// Add the tree cover layer in green.
/*
Map.addLayer(landCover, 
{palette: ['05450a', '086a10', '54a708', 
            '78d203', '009900', 'c6b044',
            'dcd159', 'dade48', 'fbff13', 
            'b6ff05', '27ff87', 'c24f44', 
            'a5a5a5', 'ff6d4c', '69fff8', 
            'f9ffa4', '1c0dff'], max: 17}, 'MODIS Land Cover');

Map.addLayer(treeCover.updateMask(treeCover),
    {palette: ['000000', '00FF00'], max: 100}, 'Forest Cover');

// Add the loss layer in red.
Map.addLayer(lossImage.updateMask(lossImage),
    {palette: ['FF0000']}, 'Loss');

// Add the gain layer in blue.
Map.addLayer(gainImage.updateMask(gainImage),
    {palette: ['0000FF']}, 'Gain');

// Show the loss and gain image.
Map.addLayer(gainAndLoss.updateMask(gainAndLoss),
    {palette: 'FF00FF'}, 'Gain and Loss');
  */  
    
    
 // Load country boundaries from a Fusion Table.

    
// Get a feature collection with just the States feature.
//var alabama = states.filter(ee.Filter.eq('name', 'Alabama'));
var theSouthNames = ['Alabama', 'Arkansas', 'Florida', 
                'Georgia', 'Kentucky', 'Louisiana', 
                'Mississippi', 'North Carolina', 'Oklahoma', 
                'South Carolina', 'Tennessee', 'Virginia'];

var soAmNames = ['Argentina','Bolivia','Brazil',
                    'Chile','Colombia','Ecuador',
                    'Guyana','Paraguay','Peru',
                    'Suriname','Uruguay','Venezuela'];

var theSouthFilters = {};
var soAmFilters = {};


//define my two custom functions

var calcSqM = function(image, region, layerName){
  var stats = image.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: region, 
    scale: 30,
    maxPixels: 1e9,
    bestEffort: true
  })
  return stats.get(layerName);
};

var filterMe = function(fTable, tableId, name){
  return fTable.filter(ee.Filter.eq(tableId, name));
};

//var fcYes = ee.Image(treeCover.filterMetadata('treecover2000', 'greater_than', 60));


//alabama = filterMe(states, theSouthNames[0]);
var argentina = filterMe(countries, soAmNames[0]);

for(var i = 0; i < theSouthNames.length; i++){
  theSouthFilters[theSouthNames[i]] = filterMe(states, 'name', theSouthNames[i]);
  soAmFilters[soAmNames[i]] = filterMe(countries, 'Country', soAmNames[i]);
  
}
print(soAmFilters);
print(theSouthFilters);


//calculating forest loss and gain
var finalStats = [];
var saStats = [];
for(var i = 0; i < theSouthNames.length; i++){
  finalStats.push([theSouthNames[i], 
              calcSqM(areaImageLoss, theSouthFilters[theSouthNames[i]], 'loss'), 
              calcSqM(areaImageGain, theSouthFilters[theSouthNames[i]], 'gain'),
              calcSqM(treeCoverPix, theSouthFilters[theSouthNames[i]], 'constant')]) ;
  saStats.push([soAmNames[i], 
              calcSqM(areaImageLoss, soAmFilters[soAmNames[i]], 'loss'), 
              calcSqM(areaImageGain, soAmFilters[soAmNames[i]], 'gain'),
              calcSqM(treeCoverPix, soAmFilters[soAmNames[i]], 'constant')]);
  
  
}


/*    var argentina = [soAmNames[0], 
              calcSqM(areaImageLoss, soAmFilters[soAmNames[0]], 'loss'), 
              calcSqM(areaImageGain, soAmFilters[soAmNames[0]], 'gain') ];
*/

print(saStats);
print(finalStats);

/*var alLoss = calcSqM(areaImageLoss, theSouthFilters['Alabama'], 'loss');
print(alLoss);
var akStats = calcSqM(areaImageLoss, theSouthFilters['Arkansas'], 'loss');
print(akStats);*/

//var loseMe = calcSqM(areaImageLoss, alabama, 'loss');

/*// Sum the values of loss pixels in our region.
var lossStats = areaImageLoss.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: alabama,
  scale: 30,
  maxPixels: 1e9
});

var gainStats = areaImageGain.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: alabama,
  scale: 30,
  maxPixels: 1e9
});*/
//print('pixels representing loss: ', lossStats.get('loss'), 'square meters');
//print('pixels representing gain: ', gainStats.get('gain'), 'square meters');