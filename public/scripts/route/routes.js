// This code is placed in your scripts/routes.js file
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc ,addDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const stopsCollection = collection(db, 'stops'); // Reference to the 'stops' collection
const routesCollection = collection(db, 'routes');
let map;
let existingPolyline;// Variable to store the existing polyline
let encodedPolyline;

map = new google.maps.Map(document.getElementById('map'), {
  center: { lat: 12.8406, lng: 80.1534 }, // Replace with your default coordinates
  zoom: 15, // Adjust the zoom level as needed
});

  // Reference to the 'boarding' select element
  const boardingSelect = document.getElementById('boarding');
// Update the start and end location dropdowns
function populateLocationDropdowns() {
  const startSelect = document.getElementById('start');
  const endSelect = document.getElementById('end');

  // Fetch locations from the Firestore "stops" collection and add them to the dropdowns
  getDocs(stopsCollection)
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        const stopData = doc.data();
        const option = document.createElement('option');
        option.value = doc.id; // Use the stop ID as the option value
        option.text = stopData.name; // Use the stop name as the option text
        startSelect.appendChild(option);
        endSelect.appendChild(option.cloneNode(true));
      });
    })
    .catch(function (error) {
      alert('Error fetching locations:', error);
    });
}

// Call the populateLocationDropdowns function to populate the dropdowns initially
populateLocationDropdowns();

// Function to populate the boarding points dropdown
function populateBoardingPoints() {
  // Clear the existing options
  boardingSelect.innerHTML = '<option value="" disabled selected>Select a boarding point</option>';

  // Fetch boarding points from the stopsCollection and add them to the dropdown
  getDocs(stopsCollection)
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        const stopData = doc.data();
        const option = document.createElement('option');
        option.value = doc.id; // Use the stop ID as the option value
        option.text = stopData.name; // Use the stop name as the option text
        boardingSelect.appendChild(option);
      });
    })
    .catch(function (error) {
      alert('Error fetching boarding points:', error);
    });
}
document.getElementById('save-route').addEventListener('click', async function (event) {
  event.preventDefault(); // Prevent default form submission behavior

  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;
  const selectedBoardingOption = document.getElementById('boarding').value;
  // const polyline = encodedPolyline;
  const routeName = document.getElementById('route-name').value;

  // Validate that a boarding point is selected
  if (!selectedBoardingOption) {
    alert('Please select a boarding point.');
    return;
  }




  const destinationName = await getSelectedBoardingPointName('end');
  const sourceName = await getSelectedBoardingPointName('start');
  

    let routeData = {
      enabled: true,
      destination_id: document.getElementById('end').value,
      destination_name: destinationName,
      polyline_id: encodedPolyline,
      route_name: routeName,
      source_id: document.getElementById('start').value,
      source_name: sourceName,
      stop_id: selectedBoardingPointIds,
      stop_name: selectedBoardingPointNames // Add the selected boarding point

    };

    console.log(routeData.source_name)
  
    const isRouteExisting = await checkIfRouteExists(start, end, selectedBoardingOption);

    if (isRouteExisting) {
      alert('This route already exists. Please choose a different combination.');
      return;
    }
      // Add the route data to Firestore

      const docRef = await addDoc(routesCollection, routeData);
      const route_id = docRef.id;
      routeData.route_id = route_id;

      console.log('Route added:', routeData);
      await setDoc(doc(routesCollection, route_id), routeData);

      // Add route_id and route_name to the routes_name document
      const routesNameDoc = doc(db, 'route_names', 'route_names'); // Reference the document
console.log(routeName);

// First, get the current data in the document
const routesNameData = (await getDoc(routesNameDoc)).data() || {};

// Then, add the new route ID and route name to the data
routesNameData[routeData.route_id] = routeName;

// Finally, update the document with the modified data
await setDoc(routesNameDoc, routesNameData);

alert('Route added:', routeName)
setTimeout(() => {
  // Redirect or perform any other actions after deletion
  window.location.href="../Route/add-route.html"
  successMessage.style.display = 'none';
}, 1500);
    
  
});

// Call the populateBoardingPoints function to populate the dropdown initially
populateBoardingPoints();

async function checkIfRouteExists(start, end, boardingPoint) {
  // Simulated or stubbed logic to check if a route with the same details exists
  // Replace this logic with the actual query to your Firestore to check if the route exists
  const existingRoutesSnapshot = await getDocs(routesCollection);
  const isDuplicate = existingRoutesSnapshot.docs.some(doc => {
    const data = doc.data();
    return (
      data.source_id === start &&
      data.destination_id === end &&
      data.stop_id.includes(boardingPoint)
    );
  });

  return isDuplicate;
}

const directionsService = new google.maps.DirectionsService();
const directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

const startInput = document.getElementById('start');
// const startAutocomplete = new google.maps.places.Autocomplete(startInput);

const endInput = document.getElementById('end');
// const endAutocomplete = new google.maps.places.Autocomplete(endInput);

// Function to calculate the route and return the polyline as a string

async function calculateRouteAndGeneratePolyline(start, end, boardingPoints) {
  return new Promise(async (resolve) => {
    const waypoints = boardingPoints.map((point) => ({
      location: `${point.latitude},${point.longitude}`,
      stopover: true,
    }));

    waypoints.forEach((waypoint) => {
      console.log(waypoint.location);
    });
    
   

    const request = {
      origin: `${start.latitude},${start.longitude}`,
      destination: `${end.latitude},${end.longitude}`,
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, function (result, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        const route = result.routes[0];
        const overviewPath = route.overview_path;
        const encodedPath = google.maps.geometry.encoding.encodePath(overviewPath);
        resolve(encodedPath);
      } else {
        alert('Directions request failed with status: ' + status);
        resolve(null);
      }
    });
  });
}


async function updatePolyline() {
  const start = await getSelectedBoardingPointData('start');
  const end = await getSelectedBoardingPointData('end');
  const boardingPoints = selectedBoardingPoints; // Use all the selected boarding points

  if (boardingPoints.length > 0) {
    const encodedPolyline = await calculateRouteAndGeneratePolyline(start, end, boardingPoints);

    if (encodedPolyline) {
      const decodedPath = google.maps.geometry.encoding.decodePath(encodedPolyline);
      const newPolyline = new google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: 'blue',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      if (existingPolyline) {
        existingPolyline.setMap(null); // Clear the existing polyline from the map
      }

      newPolyline.setMap(map);

      const bounds = new google.maps.LatLngBounds();
      decodedPath.forEach((point) => {
        bounds.extend(point);
      });
      map.fitBounds(bounds);

      // Update the existingPolyline with the new polyline
      existingPolyline = newPolyline;
    } else {
      alert('Failed to calculate the route.');
    }
  }
}


async function getSelectedBoardingPointName(elementId) {
  const selectedOption = document.getElementById(elementId).value;
  const selectedStopDocRef = doc(db, 'stops', selectedOption);

  try {
    const docSnap = await getDoc(selectedStopDocRef);
    if (docSnap.exists()) {
      const stopData = docSnap.data();
      return stopData.name; // Return the name of the stop
    } else {
      alert('Selected stop not found in the database.');
      return null;
    }
  } catch (error) {
    alert('Error getting selected stop data:', error);
    return null;
  }
}


// Function to get the selected boarding point's latitude and longitude
async function getSelectedBoardingPointData(elementId) {
  const selectedOption = document.getElementById(elementId).value;

  // Check if a stop is selected, if not, return null immediately
  if (!selectedOption) {
    return null;
  }

  const selectedStopDocRef = doc(db, 'stops', selectedOption);

  try {
    const docSnap = await getDoc(selectedStopDocRef);
    if (docSnap.exists()) {
      const stopData = docSnap.data();
      return  { latitude: stopData.latitude, longitude: stopData.longitude };
      // Return the name of the stop
    } else {
      alert('Selected stop not found in the database.');
      return null;
    }
  } catch (error) {
    alert('Error getting selected stop data:', error);
    return null;
  }
}
// Listen for the "calculate-route" button click and generate the polyline
document.getElementById('calculate-route').addEventListener('click', async function (event) {
  event.preventDefault();
  const start = await getSelectedBoardingPointData('start');
  const end = await getSelectedBoardingPointData('end');
  const selectedBoardingData = await getSelectedBoardingPointData('boarding');

  if (existingPolyline) {
    existingPolyline.setMap(null); // Clear the existing polyline from the map
    updatePolyline();
  }

  if (!isNaN(start.latitude) && !isNaN(start.longitude) && selectedBoardingData) {
    encodedPolyline = await calculateRouteAndGeneratePolyline(start, end, selectedBoardingPoints);

    if (encodedPolyline) {
      const decodedPath = google.maps.geometry.encoding.decodePath(encodedPolyline);
      const polyline = new google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: 'blue',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      polyline.setMap(map);

      const bounds = new google.maps.LatLngBounds();
      decodedPath.forEach((point) => {
        bounds.extend(point);
      });
      map.fitBounds(bounds);

      existingPolyline = polyline; // Update the existingPolyline with the new polyline
    } else {
      alert('Failed to calculate the route.');
    }
  }
});


let markers=[];
const selectedBoardingPoints = [];
const selectedBoardingPointNames = [];
const selectedBoardingPointIds = [];

// Function to add a marker for a place
function addPlaceMarker(placeData, color) {
  console.log('Adding marker for:', placeData);

  // Reference to the Firestore document
  const stopDocRef = doc(db, 'stops', placeData);

  // Get the document data
  getDoc(stopDocRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const stopData = docSnap.data();
        const location = new google.maps.LatLng(stopData.latitude, stopData.longitude);
      
        console.log(`location:  ${location}`);

        if (
          stopData.stop_id !== document.getElementById('end').value && // Check if it's not the start location
          stopData.stop_id !== document.getElementById('start').value &&   // Check if it's not the end location
          !selectedBoardingPoints.some(point => point.stop_id === stopData.stop_id) // Check if it's not already added
        ) {
          selectedBoardingPoints.push(stopData);
          selectedBoardingPointIds.push(stopData.stop_id)
          selectedBoardingPointNames.push(stopData.name); // Store the stop name
          updateBoardingPointList();
        }

        console.log(selectedBoardingPointNames)

        const marker = new google.maps.Marker({
          position: location,
          map: map,
          title: stopData.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10, // Adjust the scale to change the size
            fillColor: color,
            fillOpacity: 1, // Full opacity
            strokeWeight: 0 // No border
          }
        });
        markers.push(marker)
      } else {
        alert('Document not found:', placeData);
      }
    })
    .catch((error) => {
      alert('Error fetching document:', error);
    });
}

    // Function to add markers for selected boarding points from the dropdown
    function addBoardingMarkers() {
      const selectedBoardingOption = document.getElementById('boarding').value;

      const start = document.getElementById('start').value;
      const end = document.getElementById('end').value;
      const existingMarkers = {}; // Store existing markers
        // Function to remove all markers from the map
      function removeMarkers() {
        markers.forEach(marker => {
          marker.setMap(null);
        });

        // Clear the 'markers' array
        markers.length = 0;
      }
      // Remove existing markers before adding new ones
      removeMarkers();
      // Function to add a marker if it doesn't exist
      function addMarkerIfNotExists(location, color) {
        if (!existingMarkers[location]) {
          addPlaceMarker(location, color);
          existingMarkers[location] = true; // Mark as added
        }
      }
    
      // Check and add markers for start and end locations
      addMarkerIfNotExists(start, 'red'); // Add start marker if it doesn't exist
      addMarkerIfNotExists(end, 'green'); // Add end marker if it doesn't exist
    
      // Add a marker for selected boarding point if it's different from start or end
      if (selectedBoardingOption && selectedBoardingOption !== start && selectedBoardingOption !== end&&
        selectedBoardingPointIds.indexOf(selectedBoardingOption) === -1) {
        addPlaceMarker(selectedBoardingOption, 'purple');
      }
    
      selectedBoardingPoints.forEach(boardingPoint => {
      const placeData = boardingPoint.stop_id;
      addPlaceMarker(placeData, 'purple'); // Use a different color for stored points
      });
    }
    
  // Function to update the boarding points list in the HTML
  function updateBoardingPointList() {
    const boardingListDiv = document.getElementById('boarding-point-list');
    boardingListDiv.innerHTML = ''; // Clear the previous list
  
    // Loop through selected boarding point names and add them to the boarding list div
// Loop through selected boarding points and add them to the boarding list div
selectedBoardingPoints.forEach((point, index) => {
  const boardingPointDiv = document.createElement('div');
  boardingPointDiv.textContent = ` ➽ ${point.name}`; // Use 'point.name' instead of 'selectedBoardingPoints.name'

  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';

  boardingPointDiv.appendChild(removeButton);
  boardingListDiv.appendChild(boardingPointDiv);

  removeButton.addEventListener('click', function () {
    // Handle the removal of the boarding point here
    if (index !== -1) {
      selectedBoardingPointNames.splice(index, 1);
      selectedBoardingPoints.splice(index, 1);
      selectedBoardingPointIds.splice(index, 1); // Remove the corresponding stop_id
      updateBoardingPointList();
      addBoardingMarkers();
      // updatePolyline();
    }
  });
});
  }
// // Event listener for adding a new boarding point
// document.getElementById('add-boarding').addEventListener('click', async function () {
//   const selectedBoardingData = await getSelectedBoardingPointData('boarding');

//   if (selectedBoardingData) {
//     // Add the selected boarding point to the array
//     selectedBoardingPoints.push(selectedBoardingData);
//     updateBoardingPointList(); // Update the HTML list of boarding points
//   }
// });
// Event listener for the "Add Boarding Points" button
document.getElementById('add-boarding').addEventListener('click', async function () {
  const startLocation = document.getElementById('start').value;
  const endLocation = document.getElementById('end').value;

  // Check if both start and end locations are defined
  if (startLocation && endLocation) {
    const selectedBoardingData = document.getElementById('boarding').value;
    const selectedStopDocRef = doc(db, 'stops', selectedBoardingData);

    try {
      const docSnap = await getDoc(selectedStopDocRef);
      if (docSnap.exists()) {
        const stopData = docSnap.data();
        const stopId = stopData.stop_id;

        const existingStopIndex = selectedBoardingPointIds.indexOf(stopId);

        if (existingStopIndex !== -1) {
          // If the stop ID exists, remove it from the arrays
          selectedBoardingPoints.splice(existingStopIndex, 1);
          selectedBoardingPointIds.splice(existingStopIndex, 1);
          selectedBoardingPointNames.splice(existingStopIndex, 1);
        }

        if (stopId !== endLocation && stopId !== startLocation) {
          // Add the stop to the arrays
          selectedBoardingPoints.push(stopData);
          selectedBoardingPointIds.push(stopData.stop_id);
          selectedBoardingPointNames.push(stopData.name);
          addBoardingMarkers();
          updateBoardingPointList();
          // updatePolyline(); // Consider updating the polyline if needed
        } else {
          alert('Boarding Point is same as the start or end location.');
          // Optionally, you might display a message indicating that the stop is the start or end location
        }
      } else {
        alert('Selected stop not found in the database.');
      }
    } catch (error) {
      alert('Error getting selected stop data:', error);
    }
  } else {
    alert('Start and/or end locations are not defined.');
    // Optionally, you might display a message indicating that the start and/or end locations are not defined
  }
});

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15