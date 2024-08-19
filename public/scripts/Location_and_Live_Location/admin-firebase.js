import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const routesCollection = collection(db, 'routes');

let map = new google.maps.Map(document.getElementById('map'), {
  center: { lat: 12.8406, lng: 80.1534 },
  zoom: 12
});


const searchInput = document.getElementById('search-input');
const routeDropdown = document.getElementById('route-dropdown');
const routeNamesDocRef = doc(db, 'route_names', 'route_names');

    // Get the document and populate the div with route names
  getDoc(routeNamesDocRef)
    .then((docSnapshot) => {
      if (docSnapshot.exists()) {
        const routeData = docSnapshot.data();

        // Clear the existing content in the div
        routeDropdown.innerHTML = '';

        // Assuming 'routeData' is an object with route names as key-value pairs
        for (const routeName of Object.values(routeData)) {
          // Create a div element for each route name with the 'route-option' class
          const routeDiv = document.createElement('div');
          routeDiv.textContent = routeName;
          routeDiv.className = 'route-option'; // Add the 'route-option' class

          // Append the div to the dropdown
          routeDropdown.appendChild(routeDiv);
        }
      } else {
        console.error('The "route_names" document does not exist.');
      }
    })
    .catch((error) => {
      console.error('Error getting the "route_names" document: ', error);
    });

  // Add a listener for the input event on the search input
  searchInput.addEventListener('input', function () {
    const filter = searchInput.value.toLowerCase();
    const routeOptions = routeDropdown.getElementsByClassName('route-option');

    // Loop through the route options and hide/show them based on the filter
    for (const routeOption of routeOptions) {
      const routeName = routeOption.textContent.toLowerCase();
      if (routeName.includes(filter)) {
        routeOption.style.display = 'block';
      } else {
        routeOption.style.display = 'none';
      }
    }
  });

    let stopMarkers = [];
    // Track the current route ID
    let currentRouteID;
    // Assuming you have a function that decodes polylines (e.g., using the Google Maps API):
    function decodePolyline(encoded) {
      const path = google.maps.geometry.encoding.decodePath(encoded);
      return path;
    }
    
    function getBusIDForRoute(routeID) {
      const busDataCollection = collection(db, 'bus_data');
    
      // Query the 'bus_data' collection to find a document with the matching routeID
      getDocs(busDataCollection)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const busData = doc.data();
            if (busData.route_id === routeID) {
              const busID = busData.bus_id;
              console.log(`Bus ID for the selected route (Route ID ${routeID}): ${busID}`);


                  // getLatestLiveTrackingData(busID)  //Clearing the previous marker before adding a new 1.
                  setInterval(() => {
                    clearMarkers();
                    getLatestLiveTrackingData(busID);
                  }, 2500);
                  return; // Stop searching when the first match is found
            }
            
          });
        })
        .catch((error) => {
          console.error('Error querying bus_data: ', error);
        });
    }

    let Livemarker=[];
    function addMarker(location, color, title) {
      const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: title,
        icon:{
        url: 'https://static.thenounproject.com/png/886617-200.png',
        scaledSize: new google.maps.Size(50, 50),
        }
      });
      Livemarker.push(marker);
    }
    function clearMarkers() {
      Livemarker.forEach(marker => {
        marker.setMap(null);
      });
    
      Livemarker.length = 0; // Clear the array of markers
    }
    let alertCount = 0;
    async function getLatestLiveTrackingData(busId) {
      try {
        if (alertCount < 2) {
          if (!busId) {
            alert('Bus ID is empty!');
            alertCount++;
            return;
          }
    
          const busLiveLocationDocRef = doc(collection(db, 'bus_live_location'), busId);
          const busSnapshot = await getDoc(busLiveLocationDocRef);
    
          if (busSnapshot.exists()) {
            const data = busSnapshot.data();
            const activeDriveValue = data.active_drive;
    
            if (!activeDriveValue) {
              alert('Active drive field is empty!');
              alertCount++;
              return;
            }
    
            const activeDriveCollectionRef = collection(busLiveLocationDocRef, activeDriveValue);
    
            // Construct the query
            const querySnapshot = await getDocs(query(
              activeDriveCollectionRef,
              orderBy('time_reached', 'desc'),
              limit(1)
            ));
    
            if (!querySnapshot.empty) {
              querySnapshot.forEach((trackingDataDoc) => {
                const trackingData = trackingDataDoc.data();
                const { latitude, longitude, time_reached } = trackingData; // Assuming these fields exist in the document
                console.log(`Active Drive: ${activeDriveValue}`);
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Timestamp: ${time_reached}`);
                const location = new google.maps.LatLng(latitude, longitude);
    
                // Check if the bus belongs to the currently selected route
                if (currentRouteID === trackingData.route_id) {
                  // Add marker to the map only if it belongs to the selected route
                  addMarker(location, 'black', `Marker at ${time_reached}`);
                  // Process the tracking data as needed
                }
              });
            } else {
              console.error(`No tracking data found for active drive: ${activeDriveValue}`);
            }
          } else {
            console.error(`No data found for bus ID: ${busId}`);
          }
        }
      } catch (error) {
        console.error("Error fetching live tracking data:", error);
      }
    }
    
    
    
  
let currentRoutePath = null;
let routeID;
routeDropdown.addEventListener('click', function(event) {
  if (event.target.classList.contains('route-option')) {
    const selectedRouteName = event.target.textContent;
    // Clear the current route path, if any
    if (currentRoutePath) {
      currentRoutePath.setMap(null);
    }

    // Clear the stops associated with the previous route, if any
    clearStopMarkers();

    // Get the route ID for the selected route name
    const routeNamesRef = doc(db, 'route_names', 'route_names');
    getDoc(routeNamesRef)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const routeData = docSnapshot.data();

          // Find the key (route name) based on the selected route name
          routeID = Object.keys(routeData).find(key => routeData[key] === selectedRouteName);
          console.log(routeID)
          if (routeID) {
            // Store the current route ID
            currentRouteID = routeID;
          

            // Call the function to get the bus_id for the selected routeID
            getBusIDForRoute(routeID);
            // Step 3: Query the 'routes' table to find records with the same route ID
            const routesRef = collection(db, 'routes');
            getDocs(routesRef)
              .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  const routeData = doc.data();
                  if (routeData.route_id === routeID) {
                    const encodedPolyline = routeData.polyline_id;
                    const stopsIds = routeData.stop_id;
                    const source = routeData.source_id;
                    const destination = routeData.destination_id;

                    // Step 4: Decode polyline and display it on the map
                    const decodedPath = decodePolyline(encodedPolyline);

                    // Create a Polyline and add it to the map
                    const routePath = new google.maps.Polyline({
                      path: decodedPath,
                      geodesic: true,
                      strokeColor: '#00000',
                      strokeOpacity: 1.0,
                      strokeWeight: 3,
                    });

                    routePath.setMap(map);

                    // Update the currentRoutePath
                    currentRoutePath = routePath;

                    // Step 5: Fetch the latitude and longitude for stops
                    const stopsCollection = collection(db, 'stops');
                    getDocs(stopsCollection)
                      .then((stopsQuerySnapshot) => {
                        stopsQuerySnapshot.forEach((stopDoc) => {
                          const stopData = stopDoc.data();
                          if (Array.isArray(stopsIds) && stopsIds.includes(stopData.stop_id)) {
                            
                            addPlaceMarker(stopData, 'red');
                          }
                          if (stopData.stop_id === source) {
                            // Add a marker for the source stop with color 'blue'
                            addPlaceMarker(stopData, 'blue');
                          }

                          if (stopData.stop_id === destination) {
                            // Add a marker for the destination stop with color 'green'
                            addPlaceMarker(stopData, 'green');
                          }
                          
                        });
                      })
                      .catch((error) => {
                        console.error('Error querying stops: ', error);
                      });
                  }
                });
              })
              .catch((error) => {
                console.error('Error querying routes: ', error);
              });
          } else {
            console.error('Route name not found in route_names');
          }
        } else {
          console.error('The "route_names" document does not exist.');
        }
      })
      .catch((error) => {
        console.error('Error getting route_names document: ', error);
      });
  }

});
    
    
    function clearStopMarkers() {
      for (const stopMarkerData of stopMarkers) {
        stopMarkerData.marker.setMap(null);
      }
      stopMarkers = [];
    }
    
    // Function to add markers for stops
    function addPlaceMarker(placeData, color) {
      console.log('Adding marker for:', placeData);
    
      const location = new google.maps.LatLng(placeData.latitude, placeData.longitude);
      console.log(location);
    
      const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: placeData.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: color,
          fillOpacity: 1,
          strokeWeight: 0,
        }
      });
    
      // Store the marker for later clearing
      stopMarkers.push({ marker });
    }

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15