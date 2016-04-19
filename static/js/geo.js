/*** GEO ***/

// Load the tile images from OpenStreetMap
var mytiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

// Initialise an empty map
var map = L.map('map');

// Read the GeoJSON data with jQuery, and create a circleMarker element for each tweet
// * important: map changes
$.getJSON("/geo/data", function(data) {

    mylayer = updateLayer(data);

    mylayer.addTo(map);

    $range.on("change", function () {
        mylayer.clearLayers();
        mylayer = L.featureGroup().addLayer(updateLayer(data));
        mylayer.addTo(map);
    });
});

// change zoom button to topright
map.zoomControl.setPosition('topright');

// Add the tiles to the map, and initialise the view in a point which allows us to see the whole earth
map.addLayer(mytiles).setView([40, 1], 2);

// Read the GeoJSON data with jQuery, and create a circleMarker element for each tweet
function updateLayer(data) {
    return L.geoJson(data, {
        // style based on sentiment data
        style: function (feature) {
            var color;
            var polarity = feature.properties.sentiment.polarity;
            if(polarity == 0){
                color = "black";
            } else if (polarity > 0){
                color = "green";
            } else {
                color = "red";
            }
            return {
                radius: 2,
                fillColor: color,
                color: color,
                weight: 1,
                opacity: 0.8,
                fillOpacity: 1
            };
        },

        // popup window - status shows
        onEachFeature: function (feature, layer) {
            var mydate = new Date(feature.properties.created_at);
            var year = mydate.getFullYear();
            var month = zeroPad(mydate.getMonth()+1,2);
            var date = zeroPad( mydate.getDate(),2);
            var hour = zeroPad(mydate.getHours(),2);
            var min = zeroPad(mydate.getMinutes(),2);
            var sec = zeroPad(mydate.getSeconds(),2);
            var datestr =  year +'-'+ month +'-'+ date +' '+ hour +':'+ min +':'+ sec;

            var sentiment_polarity = feature.properties.sentiment.polarity.toFixed(2);
            var sentiment_subjectivity = feature.properties.sentiment.subjectivity.toFixed(2);

            var text = "@" + feature.properties.screen_name + ": " + feature.properties.text
                + "<br />" + datestr
                + "<br />" + "polarity: "+sentiment_polarity + ", subjectivity:" + sentiment_subjectivity;
            layer.bindPopup(text);
        },

        // updates according to time
        filter: function(feature, layer) {
            return feature.properties.created_at/1000 <= Number($("#range").val());
        },

        // set point position based on (lat,lng)
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        }

    });
}

// a helper to add 0
function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
};
