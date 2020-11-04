
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

// - - - - - - - - - - - - MARKERS - - - - - - - - - - - -
var markerOptions = {
   title: "MyLocation",
   clickable: true,
   draggable: true,
}


class Station {
   constructor(name, id) {
      this.name = name;
      this.station_id = id;
   }
}


var fixedMarkerOptions = {
   title: "Station",
   clickable: true,
   draggable: false

}

var markerArray = []

var stationUrl = 'https://gbfs.urbansharing.com/oslobysykkel.no/station_information.json';

fetch(stationUrl)
   .then(res => res.json())
   .then((out) => {
  	   out.data.stations.forEach(station => {
         let newStation = Object.assign(new Station, station);
         markerArray.push(newStation);
         }
      )
      addBicycleInfo()
      addMarkersToMap()
   })
   .catch(err => { throw err });

function addBicycleInfo() {
   let bicycleAvailability = 'https://gbfs.urbansharing.com/oslobysykkel.no/station_status.json'
   fetch(bicycleAvailability)
      .then(res => res.json())
      .then((out) => {
         out.data.stations.forEach(station => {
            markerArray.forEach(element => {
               if (station.station_id == element.station_id) {
                  element = Object.assign(element, station)
               }            
            });
         })
      })

      .catch(err => {throw err});
}

function addMarkersToMap() {
   markerArray.forEach(station => {
         let marker = L.marker([station.lat, station.lon], fixedMarkerOptions)
         marker.bindPopup(station.name).openPopup();
         marker.addEventListener('click', () => {showStationInfo(station)});
         marker.addTo(map)
      }
   );
}


/*var marker = L.marker([58.02707, 38.86224], markerOptions);
marker.bindPopup('Hi, this is my work! :)').openPopup();
marker.addTo(map);*/

// - - - - - - - - - - - - CIRCLE - - - - - - - - - - - -
var circleCenter = [58.02707, 38.86224];

var circleOptions = {
   color: 'green'
}

var circle = L.circle(circleCenter, 20, circleOptions);
circle.addTo(map);


// - - - - - - - - - - - -Station Info - - - - - - - - - - 

function showStationInfo(object) {
   let div = document.getElementById('station_info');
   div.innerText = ""

   let h2 = document.createElement("h2");
   let p1 = document.createElement("p");
   let p2 = document.createElement("p");

   h2.innerText = object.name;
   p1.innerText = "Available bikes: " + object.num_bikes_available;
   p2.innerText = "Free spots: " + object.num_docks_available;

   div.appendChild(h2);
   div.appendChild(p1);
   div.appendChild(p2);

   let string = "	<h2>Name: </h2> <p>Available bikes: </p> <p>Free spots: </p>"
}