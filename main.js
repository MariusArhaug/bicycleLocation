
// - - - - - - - - - - - - MAP - - - - - - - - - - - -
var map;
function iniateMap() {
   var mapOptions = {
      center: [59.911491, 10.757933], 
      zoom: 15
   }
   map = new L.map('map', mapOptions);

   var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
   map.addLayer(layer);

}
// - - - - - - - - - - - - MARKERS - - - - - - - - - - - -



class Station {
   constructor(name, id) {
      this.name = name;
      this.station_id = id;
      this.active = false;
      this.marker = undefined
   }

   isActive() {
      return this.active
   }

   click() {
      if (this.active == false) {
         this.active = true;
      }
      else if (this.active == true) {
         this.active = false;   
      }
   }

   setMarker(marker) {
      this.marker = marker;
   }
}


var stationArray = []
//1
async function addStationInfo() {
   let stationUrl = 'https://gbfs.urbansharing.com/oslobysykkel.no/station_information.json';
   fetch(stationUrl)
   .then(res => res.json())
   .then((out) => {
      out.data.stations
         .forEach(station => {
            let newStation = Object.assign(new Station, station);
            stationArray.push(newStation);
         })
     
   })
   .catch(err => { throw err });
  

}

//2
async function addBicycleInfo() {
   let bicycleAvailability = 'https://gbfs.urbansharing.com/oslobysykkel.no/station_status.json'
   fetch(bicycleAvailability)
      .then(res => res.json())
      .then((out) => {
         out.data.stations
            .forEach(jsonData => {
               stationArray
               .filter(station => station.station_id == jsonData.station_id)
               .map(station => Object.assign(station, jsonData))
         })
      })

      .catch(err => {throw err});
}


function addMarkersToMap() {
   let fixedMarkerOptions = {
      title: "Station",
      clickable: true,
      draggable: false,
      id: undefined,
      popupAnchor: [1, -34],
   }
   stationArray.forEach(station => {
         fixedMarkerOptions.id = station.station_id;
         let marker = L.marker([station.lat, station.lon], fixedMarkerOptions)
         station.setMarker(marker);

         marker.bindPopup(station.name).openPopup();
         marker.addEventListener('click', () => {
            showStationInfo(station);
            highlightMarker(station);   
         });
         marker.addTo(map)
      }
   );
   stationArray.filter(station => station.num_bikes_available == 0).forEach(station => station.marker.setIcon(new emptyIcon));

}

// - - - - - - -

var normalIcon = L.Icon.extend({
   options: {
      iconUrl: "marker-icon.png",
      popupAnchor: [1, -34],
   }
});

var activeIcon = L.Icon.extend({
   options: {
      iconUrl: "marker-icon-active.png",
      popupAnchor: [1, -34],
   }
});

var emptyIcon = L.Icon.extend({
   options: {
      iconUrl: "marker-icon-empty.png",
      popupAnchor: [1, -34],
   }
})



function highlightMarker(station) {
      station.click();
      if (station.isActive() == true) {
         station.marker.setIcon(new activeIcon);

      } else {
         station.marker.setIcon(new normalIcon)
         stationArray
            .filter(object => object.station_id != station.station_id && object.num_bikes_available > 0)
            .forEach(object => object.marker.setIcon(new normalIcon));
      }
}


// - - - - - - - - - - - -Station Info - - - - - - - - - - 

function showStationInfo(station) {
   let div = document.getElementById('station_info');
   div.innerText = ""

   let h2 = document.createElement("h3");
   let p1 = document.createElement("p");
   let p2 = document.createElement("p");

   h2.innerText = station.name;
   p1.innerText = "Available bikes: " + station.num_bikes_available;
   p2.innerText = "Free spots: " + station.num_docks_available;

   div.appendChild(h2);
   div.appendChild(p1);
   div.appendChild(p2);

   let string = "	<h2>Name: </h2> <p>Available bikes: </p> <p>Free spots: </p>"
}

// - - - - - - - - - - - -Main - - - - - - - - - - - - - -
window.onload = main

function main() {
   iniateMap();
   
}