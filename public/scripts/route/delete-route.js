import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc ,addDoc, setDoc,  query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);


const searchInput = document.getElementById('data-input');
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
// Define a variable to store the selected route's key (ID) from Firestore
let selectedRouteKey = null;

// Event listener for route selection
routeDropdown.addEventListener('click', async function (event) {
  if (event.target && event.target.className === 'route-option') {
    searchInput.value = event.target.textContent;

    // Retrieve the ID (key) of the selected route from Firestore data
    const routeNamesDocRef = doc(db, 'route_names', 'route_names');
    const docSnap = await getDoc(routeNamesDocRef);

    if (docSnap.exists()) {
      const routeData = docSnap.data();

      for (const key in routeData) {
        if (routeData[key] === searchInput.value) {
          selectedRouteKey = key; // Store the selected route's key
          console.log('Selected Route ID:', selectedRouteKey);

          // Now, fetch and display route details
          const routeCollectionRef = collection(db, 'routes');
          const routeDocRef = doc(routeCollectionRef, selectedRouteKey);
          const routeDocSnap = await getDoc(routeDocRef);

          if (routeDocSnap.exists()) {
            const routeInfo = routeDocSnap.data();
            // Update the route-data element with the route information
            const routeDataElement = document.querySelector('.route-data');
            routeDataElement.innerHTML = `
              <p>Source: ${routeInfo.source_name}</p>
              <p>Destination: ${routeInfo.destination_name}</p>
              <p>Boarding Points:</p>
              <ul>
                ${routeInfo.stop_name.map(point => `<li>${point}</li>`).join('')}
              </ul>
            `;
          } else {
            console.error('The selected route does not exist in the "routes" collection.');
          }
          break;
        }
      }
    } else {
      console.error('The "route_names" document does not exist.');
    }
  }
});

// Add event listener for the "Delete Route" button
const deleteButton = document.getElementById('submit');
const deleteConfirmation = document.getElementById('deleteConfirmation');
const confirmDeleteButton = document.getElementById('confirmDelete');
const cancelDeleteButton = document.getElementById('cancelDelete');
const successMessage = document.getElementById('success-message');

// Initially hide the delete confirmation popup
deleteConfirmation.style.display = 'none';

deleteButton.addEventListener('click', function () {
  // Show the confirmation popup
  deleteConfirmation.style.display = 'block';
});

// Add event listener for the "Yes" button
confirmDeleteButton.addEventListener("click", async function () {
  // Check if a route is selected
  if (!selectedRouteKey) {
    console.error("No route is selected.");
    return;
  }

  // Delete the selected route from the "routes" collection
  const routeDocRef = doc(db, "routes", selectedRouteKey);
  await deleteDoc(routeDocRef);

  // Delete the selected route from the "route_names" collection
  const routeNamesDocRef = doc(db, "route_names", "route_names");
  const docSnap = await getDoc(routeNamesDocRef);
  if (docSnap.exists()) {
    const routeData = docSnap.data();
    if (routeData[selectedRouteKey]) {
      delete routeData[selectedRouteKey];
      await setDoc(routeNamesDocRef, routeData);
    }

    // Update bus data in the "bus_data" collection where route_id matches the deleted route
    const busDataCollectionRef = collection(db, "bus_data");
    const busesQuery = query(
      busDataCollectionRef,
      where("route_id", "==", selectedRouteKey)
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
      where("route_id", "==", selectedRouteKey)
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

    successMessage.textContent = "Route deleted successfully.";
    successMessage.style.display = "block";
    setTimeout(() => {
      window.location.href = "../Route/delete-route.html";
    }, 2000);

    // Hide the confirmation popup
    deleteConfirmation.style.display = "none";
  }
});


// Add event listener for the "No" button
cancelDeleteButton.addEventListener('click', function () {
  // Hide the confirmation popup
  deleteConfirmation.style.display = 'none';
});

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15