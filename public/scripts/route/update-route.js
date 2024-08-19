import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, where,setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const stopsCollection = collection(db, 'stops')

// Variables to store selected boarding points
const selectedBoardingPoints = [];
const selectedBoardingPointNames = [];

// Variables to store the existing polyline
let existingPolyline;
let encodedPolyline;
let routeName;
function populateRouteDropdown() {
  const routeSelect = document.getElementById('route');

  // Reference to the "cad" document within the "route_names" collection
  const cadDocRef = doc(db, 'route_names', 'route_names');

  // Get the "cad" document
  getDoc(cadDocRef)
    .then(function (docSnapshot) {
      if (docSnapshot.exists()) {
        const cadData = docSnapshot.data();
        // Assuming "cadData" is an object with key-value pairs (id: name)
        for (const key in cadData) {
          if (cadData.hasOwnProperty(key)) {
            const option = document.createElement('option');
            option.value = key; // Use the key as the option value
            option.text = cadData[key]; 
            routeName = option.text
            routeSelect.appendChild(option);
          }
          
        }
      } else {
        console.error('The "cad" document does not exist.');
      }
    })
    .catch(function (error) {
      console.error('Error fetching "cad" document:', error);
    });
}

// Call the populateRouteDropdown function to populate the route dropdown initially
populateRouteDropdown();

// Define a variable to store the selected route ID
let selectedRouteId = null;

// Add an event listener to the "route" dropdown
document.getElementById('route').addEventListener('change', function () {
  // Get the selected route ID based on the selected option's value
  selectedRouteId = this.value;
  
  // Now, you can use the selectedRouteId as needed
  console.log('Selected Route ID:', selectedRouteId);
});


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
      console.error('Error fetching locations:', error);
    });
}

// Call the populateLocationDropdowns function to populate the dropdowns initially
populateLocationDropdowns();


// Function to populate the boarding points dropdown
function populateBoardingPoints() {
  const boardingSelect = document.getElementById('boarding');

  // Clear the existing options
  boardingSelect.innerHTML = '<option value="" disabled selected>Select a boarding point</option>';

  // Fetch boarding points from the Firestore "stops" collection and add them to the dropdown
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
      console.error('Error fetching boarding points:', error);
    });
}

// Function to update the polyline based on selected boarding points
async function updatePolyline() {
  const start = await getSelectedBoardingPointData('start');
  const end = await getSelectedBoardingPointData('end');
  const boardingPoints = selectedBoardingPoints; // Use all the selected boarding points

  if (boardingPoints.length >= 0) {
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

// Function to get the selected stop's data (latitude and longitude)
async function getSelectedStopData(elementId) {
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
      return stopData; // Return the name of the stop
    } else {
      console.error('Selected stop not found in the database.');
      return null;
    }
  } catch (error) {
    console.error('Error getting selected stop data:', error);
    return null;
  }
}


// Function to calculate the route and return the polyline as a string
async function calculateRouteAndGeneratePolyline(start, end, boardingPoints) {
  return new Promise(async (resolve) => {
    const waypoints = boardingPoints.map((point) => ({
      location:` ${point.latitude},${point.longitude}`,
      stopover: true,
    }));

    waypoints.forEach((waypoint) => {
      console.log(waypoint.location);
    });
    
   

    const request = {
      origin: `${start.latitude},${start.longitude}`,
      destination:` ${end.latitude},${end.longitude}`,
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
        console.error('Directions request failed with status: ' + status);
        resolve(null);
      }
    });
  });
}


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
      console.error('Selected stop not found in the database.');
      return null;
    }
  } catch (error) {
    console.error('Error getting selected stop data:', error);
    return null;
  }
}

// Event listener for the "Add Boarding Points" button
// Event listener for the "Add Boarding Points" button
document.getElementById('add-boarding').addEventListener('click', async function () {
  const selectedBoardingData = await getSelectedStopData('boarding');
  const StartstopId = await getSelectedStopData('start');
  const StopstopId = await getSelectedStopData('end');
  console.log("haha");
  console.log(selectedBoardingPoints);

  if (selectedBoardingData) {
    // Check if the selected boarding point is not already in the list
    const isAlreadyAdded = selectedBoardingPoints.some(point => point.stop_id === selectedBoardingData.stop_id);

    if (!isAlreadyAdded) {
      // Add the selected boarding point to the array
      selectedBoardingPoints.push(selectedBoardingData);
      selectedBoardingPointNames.push(selectedBoardingData.name); // Store the stop name

      updateBoardingPointList();
      addBoardingMarkers();
      // updatePolyline();
    } else {
      alert('Boarding point is already in the list.');
    }
  } else {
    updateBoardingPointList();
    addBoardingMarkers();
  }
  document.getElementById('boarding').value = "";
});


// Function to add markers for selected boarding points
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
  // Add markers for start and end locations if they don't exist
 

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
  if (selectedBoardingOption && selectedBoardingOption !== start && selectedBoardingOption !== end) {
    addPlaceMarker(selectedBoardingOption, 'purple');
  }
  selectedBoardingPoints.forEach(boardingPoint => {
    const placeData = boardingPoint.stop_id;
    addPlaceMarker(placeData, 'purple'); // Use a different color for stored points
  });
}
 // Iterate through the selectedBoardingPoints and add markers for the stored ones



// Function to update the boarding points list in the HTML
// function updateBoardingPointList() {
// const boardingListDiv = document.getElementById('boarding-point-list');
// boardingListDiv.innerHTML = ''; // Clear the previous list

// // Loop through selected boarding point names and add them to the boarding list div
// selectedBoardingPointNames.forEach(name => {
// const boardingPointDiv = document.createElement('div');
// boardingPointDiv.textContent =` ➽ ${name}`;
// console.log(name);
// boardingListDiv.appendChild(boardingPointDiv);
// });
// }

let markers=[];
// Function to add a marker for a place
function addPlaceMarker(placeData, color) {
  const stopDocRef = doc(db, 'stops', placeData);

  console.log(stopDocRef)
  // Get the document data
  getDoc(stopDocRef)
    .then((docSnap) => {
      if (docSnap.exists) {
        const stopData = docSnap.data();
        console.log(stopData)
        const location = new google.maps.LatLng(stopData.latitude, stopData.longitude);

        if (
          stopData.stop_id !== document.getElementById('end').value &&
          stopData.stop_id !== document.getElementById('start').value &&
          !selectedBoardingPoints.some(point => point.stop_id === stopData.stop_id)
        ) {
          selectedBoardingPoints.push(stopData);
          selectedBoardingPointNames.push(stopData.name); // Store the stop name
          updateBoardingPointList();
        }

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
          console.log('###############');
          console.log(markers);
      } else {
        console.error('Document not found:', placeData);
      }
    })
    .catch((error) => {
      console.error('Error fetching document:', error);
    });
}

// Function to update the boarding points list in the HTML
function updateBoardingPointList() {
  const boardingListDiv = document.getElementById('boarding-point-list');
  boardingListDiv.innerHTML = ''; // Clear the previous list

  // Loop through selected boarding point names and add them to the boarding list div
  selectedBoardingPointNames.forEach(name => {
    const boardingPointDiv = document.createElement('div');
    boardingPointDiv.textContent =` ➽ ${name}`;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
   

    boardingPointDiv.appendChild(removeButton);
    boardingListDiv.appendChild(boardingPointDiv);
    removeButton.addEventListener('click', function () {
      // Handle the removal of the boarding point here
      const index = selectedBoardingPointNames.indexOf(name);
      if (index !== -1) {
        selectedBoardingPointNames.splice(index, 1);
        selectedBoardingPoints.splice(index, 1);
        updateBoardingPointList();
        // addBoardingMarkers();
        // updatePolyline();
      }
    });
  });
}

// Event listener for the "Calculate Route" button
document.getElementById('calculate-route').addEventListener('click', async function (event) {
  event.preventDefault();
  const start = await getSelectedBoardingPointData('start');
  const end = await getSelectedBoardingPointData('end');
  const selectedBoardingData = await getSelectedBoardingPointData('boarding');

  if (existingPolyline) {
    existingPolyline.setMap(null); // Clear the existing polyline from the map
    updatePolyline();
  }

  if (!isNaN(start.latitude) && !isNaN(start.longitude)) {
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
      console.error('Failed to calculate the route.');
    }
  }
});


function displayRouteDetails(routeId) {
  // Replace 'your-route-collection' with the actual collection where route data is stored
  const selectedRouteRef = doc(db,"routes", routeId);
  console.log(selectedRouteRef)

  getDoc(selectedRouteRef)
    .then(function (docSnapshot) {
      if (docSnapshot.exists()) {
        const selectedRouteData = docSnapshot.data();

        // Populate "Start" and "End" dropdowns
        document.getElementById('start').value = selectedRouteData.source_id;
        document.getElementById('end').value = selectedRouteData.destination_id;

        

// Populate and display the "Boarding List" based on selected route
const boardingListDiv = document.getElementById('boarding-point-list');
boardingListDiv.innerHTML = ''; // Clear the previous list

if (selectedRouteData.stop_id && Array.isArray(selectedRouteData.stop_id)) {
  selectedBoardingPointNames.length = 0; // Clear the selected boarding point names
  selectedBoardingPoints.length = 0; // Clear the selected boarding points
  selectedRouteData.stop_id.forEach(async (stopId) => {
    // Fetch the boarding points based on 'stop_id' from the 'stops' collection
    const stopQuery = query(stopsCollection, where('stop_id', '==', stopId));
    console.log("hehe")
    console.log(stopQuery)
    getDocs(stopQuery)
      .then(function (querySnapshot) {
        if (!querySnapshot.empty) {
          const stopData = querySnapshot.docs[0].data();
          selectedBoardingPointNames.push(stopData.name); // Store the stop name
          selectedBoardingPoints.push(stopData);
          updateBoardingPointList();
        } else {
          console.error('No data found for stop_id:', stopId);
        }
      })
      .catch(function (error) {
        console.error('Error fetching stop data:', error);
      });
  });
}

// ...


        // Optionally, you can add logic to display or hide the "Boarding List" section
        // if (selectedBoardingPointNames.length > 0) {
        //   boardingListDiv.style.display = 'block'; // Display the boarding list
        // } else {
        //   boardingListDiv.style.display = 'none'; // Hide the boarding list
        // }
      } else {
        console.error('No data found for the selected route.');
      }
    })
    .catch(function (error) {
      console.error('Error fetching selected route data:', error);
    });
}

// Event listener for the "route" dropdown
document.getElementById('route').addEventListener('change', function () {
  displayRouteDetails(selectedRouteId);
});

async function getSelectedBoardingPointName(elementId) {
  const selectedOption = document.getElementById(elementId).value;
  const selectedStopDocRef = doc(db, 'stops', selectedOption);

  try {
    const docSnap = await getDoc(selectedStopDocRef);
    if (docSnap.exists()) {
      const stopData = docSnap.data();
      return stopData.name; // Return the name of the stop
    } else {
      console.error('Selected stop not found in the database.');
      return null;
    }
  } catch (error) {
    console.error('Error getting selected stop data:', error);
    return null;
  }
}


let updatedRouteData;
document.getElementById('update-route').addEventListener('click', async function (event) {
  event.preventDefault();

  const routeName = document.getElementById('route').value; // Get the selected route name
  const startLocation = document.getElementById('start').value; // Get the selected start location
  const endLocation = document.getElementById('end').value; // Get the selected end location

  // Validate that the required fields are selected
  if (!routeName || !startLocation || !endLocation) {
    alert('Please select a route, start location, and end location to update the route.');
    return;
  }

  const destinationName = await getSelectedBoardingPointName('end');
  const sourceName = await getSelectedBoardingPointName('start');

  // Ensure that the destinationName and sourceName are valid
  if (!destinationName || !sourceName) {
    alert('Please select valid source and destination locations.');
    return;
  }
  console.log(encodedPolyline)
  if (!encodedPolyline) {
    alert('Please calculate the route and generate a valid polyline before updating the route.');
    return;
  }

  console.log(encodedPolyline)
  // Create an object with the updated route information
  if (selectedBoardingPoints) {
    updatedRouteData = {
      enabled: true,
      destination_id: endLocation,
      destination_name: destinationName,
      polyline_id: encodedPolyline, // Ensure that encodedPolyline is defined or provide a default value
      source_id: startLocation,
      source_name: sourceName,
      stop_id: selectedBoardingPoints.map(point => point.stop_id),
      stop_name: selectedBoardingPointNames, // Assuming it's valid
    };
  }

  const routeCollection = collection(db, 'routes'); // Reference
  const docRef = doc(routeCollection, selectedRouteId);

  if (updatedRouteData) {
    try {
      await setDoc(docRef, updatedRouteData, { merge: true }); // Merge the data if the document already exists
      alert('Route updated successfully!');
    } catch (error) {
      console.error('Error updating the route:', error);
      alert('An error occurred while updating the route.');
    }
  } else {
    console.error('updatedRouteData is not defined or empty.');
    alert('Please select a route and boarding points before updating.');
  }
});



// Call the populateBoardingPoints function to populate the dropdown initially
populateBoardingPoints();

// Initialize the Google Maps map and services
let map;
const directionsService = new google.maps.DirectionsService();
const directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

map = new google.maps.Map(document.getElementById('map'), {
  center: { lat: 12.8406, lng: 80.1534 }, // Replace with your default coordinates
  zoom: 15, // Adjust the zoom level as needed
});

// Initialize the existingPolyline
existingPolyline = new google.maps.Polyline({
  geodesic: true,
  strokeColor: 'blue',
  strokeOpacity: 1.0,
  strokeWeight: 2
});

// Initialize the map with the existingPolyline
existingPolyline.setMap(map);

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15