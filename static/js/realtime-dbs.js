/*** Previous GEO ***/

// Load the tile images from OpenStreetMap
var mytiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});
// Initialise an empty map
var map = L.map('map');

// Read the GeoJSON data with jQuery, and create a circleMarker element for each tweet
$.getJSON("/realtime/data", function(data) {

    // customize layer with geoJSON
    L.geoJson(data, {
        // style
        style: function (feature) {
                return {
                    radius: 2,
                    fillColor: "black",
                    color: "green",
                    weight: 1,
                    opacity: 0.8,
                    fillOpacity: 1
                };
        },
        // popup window
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.text);
        },
        // set location with (lat,lng)
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        }
    }).addTo(map);

});

// change zoom button to topright
map.zoomControl.setPosition('topright');

// Add the tiles to the map, and initialise the view in a point which allows us to see the whole earth
map.addLayer(mytiles).setView([40, 1], 2);

