
// - - - - - - - - - - - - MAP - - - - - - - - - - - -
var map;
function initiateMap() {
   let mapOptions = {
      center: [59.911491, 10.757933],  //"center" of oslo
      zoom: 15
   }
   map = new L.map('map', mapOptions);

   let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'); 
   map.addLayer(layer);
}
// - - - - - - - - - - - - Classes - - - - - - - - - - - -

//init class with usefull methods, this class will get other properties from json file
class Station {
   constructor(name, id) {
      this.name = name;
      this.station_id = id;
      this.active = false;
      this.marker = undefined
      this.empty = false;
   }

   isActive() {
      return this.active;
   }

   isEmpty() {
      return this.empty;
   }

   setEmpty(bool) {
      this.empty = bool
   }

   setInactive() {
      this.active = false;
      this.changeIcon();
      this.marker.closePopup()
   }

   click(bool) {
      this.active = bool | !this.active;
      this.changeIcon();
   }

   setMarker(marker) {
      this.marker = marker;
   }

   changeIcon() {
      if (this.empty) {
         this.marker.setIcon(new emptyIcon);   
      } else {
         this.marker.setIcon(this.active ? new activeIcon : new normalIcon);
      }
      
   }

}

// - - - - - - - - - - Read JSONs - - - - - - - - - 
//read json files then send as object, object is inherited from Station class
//but also gets properties from station in the json file
function readJSON(url) {
   const promise = new Promise((resolve, reject) => {
      fetch(url)
         .then(res => res.json())
         .then((out) => {
            resolve (out.data.stations.map(station => Object.assign(new Station, station)))    
         })
         .catch(err => {reject (err)});
   })
   return promise;
}

//makes sure that the files get read in the right order
//get info from url
//return as object with two properties, being the two arrays.
 async function computeStations() {
   let bicycleAvailabilityUrl = 'https://gbfs.urbansharing.com/oslobysykkel.no/station_status.json'
   let stationUrl = 'https://gbfs.urbansharing.com/oslobysykkel.no/station_information.json';
   let bicycleInfo = [];
   let stationInfo = [];
   await readJSON(stationUrl).then(res => stationInfo = res);
   await readJSON(bicycleAvailabilityUrl).then(res => bicycleInfo = res);
   
   return {bicycles: bicycleInfo, 
            stations: stationInfo};
 }


//combine arrays and assign properties to a final object in a final array
function combineArrays(bicylceArray, stationArray) {
   let finalArray = []
   stationArray.forEach(station => {
      bicylceArray.forEach( bicycle => {
         if (station.station_id == bicycle.station_id) {
            finalArray.push(Object.assign(bicycle, station))
         }
      })
     
   })
   return finalArray;
}

// - - - - - - - - - - - - - - - Markers - - - - - - 

//assign a marker to have a relation to equivalent object in array
function addMarkersToMap(array) {
   let fixedMarkerOptions = {
      title: "",
      clickable: true,
      draggable: false,
      id: undefined,
      popupAnchor: [1, -34],
   }
   //give methods and events
   array.forEach(station => {
         fixedMarkerOptions.id = station.station_id;
         fixedMarkerOptions.title = station.name;
         let marker = L.marker([station.lat, station.lon], fixedMarkerOptions)

         //display station name in pop and change color of marker if popup is closed
         marker.bindPopup(station.name);
         marker.addEventListener('popupclose', () => station.setInactive(false));
         marker.addEventListener('click', () => {
            showStationInfo(station);
            highlightMarker(station);   
         });

         //add to map and make marker have a relation to the station object
         marker.addTo(map)
         station.setMarker(marker);
      }
   );
   //change marker color to red for those stations that have no bikes available
   array
      .filter(station => station.num_bikes_available == 0)
      .map(station => {
         station.setEmpty(true);
         station.marker.setIcon(new emptyIcon);
      });
}

// - - - - - - - Highlights - - - - - - - - //

//some static data about the icons
var normalIcon = L.Icon.extend({
   options: {
      iconUrl: "marker-icon.png",
      shadowUrl: 'marker-shadow.png',
      popupAnchor: [1, -34],
   }
});

var activeIcon = L.Icon.extend({
   options: {
      iconUrl: "marker-icon-active.png",
      shadowUrl: 'marker-shadow.png',
      popupAnchor: [1, -34],
   }
});

var emptyIcon = L.Icon.extend({
   options: {
      iconUrl: "marker-icon-empty.png",
      shadowUrl: 'marker-shadow.png',
      popupAnchor: [1, -34],
   }
})

//change color of clicked marker
function highlightMarker(station) {
      globalStationArray
            .filter(e => e.station_id != station.station_id)
            .forEach(e => e.setInactive(false));

      station.click();  
}


// - - - - - - - - - - - -Station Info - - - - - - - - - - 
//add HTML to display info about selected station
//Its easy to add more info in the html if its desired
function showStationInfo(station) {
   let div = document.getElementById('station');
   div.innerText = "";
   
   let sel = document.getElementById('select');
   let opts = Array.prototype.slice.call(sel.options);
   
   opts
      .filter(e => e.value == station.station_id)
      .map((e) => sel.selectedIndex = opts.indexOf(e));

   let h2 = document.createElement("h3");
   let p1 = document.createElement("p");
   let p2 = document.createElement("p");

   h2.innerText = station.name;
   p1.innerText = "Available bikes: " + station.num_bikes_available;
   p2.innerText = "Free spots: " + station.num_docks_available;

   div.appendChild(h2);
   div.appendChild(p1);
   div.appendChild(p2);
}

//update select tag to include options with info about the various stations
function addOptions(array) {
   let select = document.getElementById('select');
   array
   .sort((a,b) => a.name.localeCompare(b.name))
   .forEach((e) => {
      let option = document.createElement('option');
      option.value = e.station_id;
      option.text = e.name;
      select.appendChild(option);
   })
}
//when a change occurs in the select tag, change the HTML with station info
function dropdownChange(e) {
   globalStationArray
      .filter(station => station.station_id == e)
      .map(station => {
         highlightMarker(station);
         map.panTo(new L.LatLng(station.lat, station.lon));
         showStationInfo(station)
      })
}


// - - - - - - - - - - - -Main - - - - - - - - - - - - - -
//main method to start the js document,
//computeStations() is async and therefor we need to make sure that it finishes first before we can add markers and such
var globalStationArray = [];
window.onload = main

function main() {
   initiateMap();
   computeStations()
   .then(obj => {
      globalStationArray = combineArrays(obj.bicycles, obj.stations)
      addMarkersToMap(globalStationArray);
      addOptions(globalStationArray);
   });
}