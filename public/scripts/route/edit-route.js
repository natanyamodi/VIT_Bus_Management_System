import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc,query,where } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Firebase configuration
import { firebaseConfig } from "../Firebase/config.js";

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const routesRef = collection(db, 'routes');

// Get HTML elements
const boardingSelect = document.getElementById('route');
const routeNameDisplay = document.getElementById('route-name-display');
const destinationNameDisplay = document.getElementById('destination-name-display');
const sourceNameDisplay = document.getElementById('source-name-display');
const stopsListDisplay = document.getElementById('stops-list-display');
const enableButton = document.getElementById('enableButton');
const disableButton = document.getElementById('disableButton');

let isActive;

// Function to populate the dropdown with routes
function populateRoute() {
  // Clear the existing options
  boardingSelect.innerHTML = '<option value="" disabled selected>Select a route</option>';

  // Fetch routes from the "routes" collection and add them to the dropdown
  getDocs(routesRef)
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        const routeData = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.text = routeData.route_name;
        option.dataset.routeDetails = JSON.stringify(routeData); // Store the entire route data as JSON
        boardingSelect.appendChild(option);
      });
    })
    .catch(function (error) {
      console.error('Error fetching routes:', error);
    });
}

function updateButtonStates() {
  if (isActive===true) {
    enableButton.disabled = true;
    disableButton.disabled = false;
  } else {
    enableButton.disabled = false;
    disableButton.disabled = true;
  }
}

let selectedRouteDetails = null;
// Event listener when a route is selected
boardingSelect.addEventListener('change', function () {

  const selectedOption = boardingSelect.options[boardingSelect.selectedIndex];
  const routeDetails = JSON.parse(selectedOption.dataset.routeDetails);
  selectedRouteDetails = routeDetails; // Store the selected route details
  isActive = routeDetails.enabled;

  // Display route details
  routeNameDisplay.innerHTML = `Route Name: ${routeDetails.route_name}`;
  sourceNameDisplay.innerHTML =` Source: ${routeDetails.source_name}`;
  destinationNameDisplay.innerHTML = `Destination: ${routeDetails.destination_name}`;

  // Display the list of stops in new lines
  const stopsList = routeDetails.stop_name;
  stopsListDisplay.innerHTML = 'Stops:';
  if (Array.isArray(stopsList) && stopsList.length > 0) {
    stopsList.forEach(stop => {
      const stopLine = document.createElement('div');
      stopLine.textContent = stop;
      stopsListDisplay.appendChild(stopLine);
    });
  } else {
    stopsListDisplay.innerHTML = 'No stops found for this route.';
  }

  // Update button states
  updateButtonStates();
});

// Event listener when "Enable" button is clicked
enableButton.addEventListener('click', async () => {
  if (selectedRouteDetails) {
    const routeData = selectedRouteDetails;
    const routeId = routeData.route_id;

    // Update the 'isActive' field in the 'routes' table to true
    const routeDoc = doc(db, 'routes', routeId);
    await setDoc(routeDoc, { enabled: true }, { merge: true });

    // Add the route ID and name to the 'route_names' table
    const routesNameDoc = doc(db, 'route_names', 'route_names');
    const routesNameData = (await getDoc(routesNameDoc)).data() || {};
    routesNameData[routeId] = routeData.route_name;
    await setDoc(routesNameDoc, routesNameData);

    // Update the 'isActive' variable and button states
    isActive = true;
    updateButtonStates();

    // Log the route's status
    console.log(`Route '${routeData.route_name}' (ID: ${routeId}) has been ENABLED.`);
  }
  window.location.href="../Route/edit-route.html";
});

// Event listener when "Disable" button is clicked
disableButton.addEventListener('click', async () => {
  if (selectedRouteDetails) {
    const routeData = selectedRouteDetails;
    const routeId = routeData.route_id;

    // Update the 'isActive' field in the 'routes' table to false
    const routeDoc = doc(db, 'routes', routeId);
    await setDoc(routeDoc, { enabled: false }, { merge: true });

    const busDataCollectionRef = collection(db, "bus_data");
    const busesQuery = query(
      busDataCollectionRef,
      where("route_id", "==", routeId)
    );
    const busQuerySnapshot = await getDocs(busesQuery);

    busQuerySnapshot.forEach(async (busDoc) => {
      const busData = busDoc.data();
      // Update bus data where route_id matches the deleted route
      busData.route_id = null;
      busData.on_hold = "true";

      const busDocRef = doc(busDataCollectionRef, busDoc.id);
      await setDoc(busDocRef, busData);
    });

    // Update driver data in the "driver_data" collection where route_id matches the deleted route
    const driverDataCollectionRef = collection(db, "driver_data");
    const driversQuery = query(
      driverDataCollectionRef,
      where("route_id", "==", routeId)
    );
    const driverQuerySnapshot = await getDocs(driversQuery);

    driverQuerySnapshot.forEach(async (driverDoc) => {
      const driverData = driverDoc.data();
      // Update driver data where route_id matches the deleted route
      driverData.route_id = null;
      driverData.on_hold = "true";
      driverData.bus_id=null;
      driverData.bus_number=null;

      const driverDocRef = doc(driverDataCollectionRef, driverDoc.id);
      await setDoc(driverDocRef, driverData);
    });

    // Reference the 'route_names' document
    const routesNameDoc = doc(db, 'route_names', 'route_names');

    // Get the current 'route_names' data
    const routesNameData = (await getDoc(routesNameDoc)).data() || {};

        // Update the 'isActive' variable and button states
        isActive = false;
        updateButtonStates();
    // Check if the selected route's ID exists in 'route_names' and delete it
    if (routesNameData[routeId]) {
      delete routesNameData[routeId];

      // Update the 'route_names' document with the modified data
      await setDoc(routesNameDoc, routesNameData);

      // Log the route's status
      console.log(`Route '${routeData.route_name}' (ID: ${routeId}) has been DISABLED.`);
    } else {
      console.log(`Route '${routeData.route_name}' (ID: ${routeId}) not found in 'route_names'.`);
    }
  }
  window.location.href="../Route/edit-route.html";
});

populateRoute();

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15