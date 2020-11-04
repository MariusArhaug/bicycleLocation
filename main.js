// - - - - - - - - - - - - MAP - - - - - - - - - - - -

var mapOptions = {
   center: [59.911491, 10.757933], 
   zoom: 13
}
var map = new L.map('map', mapOptions);

var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
map.addLayer(layer);

// - - - - - - - - - - - - LOGO - - - - - - - - - - - -

var iconOptions = {
   iconUrl: 'orion.png',
   iconSize: [65, 65]
}
var customIcon = L.icon(iconOptions);

// - - - - - - - - - - - - MARKER - - - - - - - - - - - -
var markerOptions = {
   title: "MyLocation",
   clickable: true,
   draggable: true,
}

var fixedMarkerOptions = {
   title: "Station",
   clickable: true,
   draggable: false

}

let url = 'https://gbfs.urbansharing.com/oslobysykkel.no/station_information.json';

fetch(url)
.then(res => res.json())
.then((out) => {
  
  	out.data.stations.forEach(station => {
  		let marker = L.marker([station.lat, station.lon], fixedMarkerOptions)
		marker.bindPopup(station.station_id).openPopup();
		marker.addTo(map)
  	}
  )

})
.catch(err => { throw err });


var marker = L.marker([58.02707, 38.86224], markerOptions);
marker.bindPopup('Hi, this is my work! :)').openPopup();
marker.addTo(map);

// - - - - - - - - - - - - CIRCLE - - - - - - - - - - - -
var circleCenter = [58.02707, 38.86224];
// Настройки круга.

var circleOptions = {
   color: 'green'
}
// СОздание круга.
var circle = L.circle(circleCenter, 20, circleOptions);
circle.addTo(map);