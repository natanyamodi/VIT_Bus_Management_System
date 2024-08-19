import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc ,addDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const busChassisNumberInput = document.getElementById('bus-chassis-number');
const busChassisNumberCounter = document.getElementById('bus-chassis-number-counter');

const busNumberInput = document.getElementById('bus-number');
const busNumberCounter = document.getElementById('bus-number-counter');

const busCapacityInput = document.getElementById('bus-capacity');
const busCapacityCounter = document.getElementById('bus-capacity-counter');


busChassisNumberInput.addEventListener('input', function () {
    const currentLength = busChassisNumberInput.value.length;
    busChassisNumberCounter.textContent =` ${currentLength}/17`;
});

busNumberInput.addEventListener('input', function () {
    const currentLength = busNumberInput.value.length;
    busNumberCounter.textContent = `${currentLength}/10`;
});

busCapacityInput.addEventListener('input', function () {
  // Ensure that the input value doesn't exceed 2 digits
  if (busCapacityInput.value.length > 2) {
    busCapacityInput.value = busCapacityInput.value.slice(0, 2); // Truncate to 2 digits
  }
  
  // Update the counter with the current length (up to 2 digits)
  busCapacityCounter.textContent =`${busCapacityInput.value.length}/2`;
});



const searchInput = document.getElementById('route-input');
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
let selectedRouteName = '';
routeDropdown.addEventListener('click', function (event) {
  // Check if the clicked element is a route option
  if (event.target && event.target.className === 'route-option') {
    // Set the input value to the selected route option's text
    searchInput.value = event.target.textContent;
    selectedRouteName = event.target.textContent;
    // Hide the dropdown (you may want to add code for this)
  }
});

const routeInput = document.getElementById('route-input');
const addButton = document.querySelector('.submit'); // Assuming you have a button with the class "submit"
const onHoldSelect = document.getElementById('onHold');
onHoldSelect.addEventListener('change', function () {
  const isOnHold = this.value === "true";
  routeInput.disabled = isOnHold;
  const Roptions = document.getElementById('route-dropdown');
    if (isOnHold) {
        Roptions.style.display = 'none';
    } else {
        Roptions.style.display = ''; // Show the route-option when isOnHold is false
    }
  routeInput.value = isOnHold ? "" : "";

});


addButton.addEventListener('click', async function () {
  // Get the values from the input fields
  const busChassisNumber = document.getElementById('bus-chassis-number').value;
  const busNumber = document.getElementById('bus-number').value;
  const busCapacity = parseInt(document.getElementById('bus-capacity').value, 10); // Parse as an integer
  const routeInput = document.getElementById('route-input').value;
  const onHoldValue = onHoldSelect.value;

  // Check if any of the input fields are empty
  if (onHoldValue === "false"){
    if (!busChassisNumber || !busNumber || isNaN(busCapacity) || busCapacity <= 0 || !routeInput) {
      alert('Please fill in all the required fields with valid data.');
      return; // Exit the function if any field is empty or invalid
    }
  
    if (busChassisNumber.length !== 17 || busNumber.length !== 10) {
      alert('Please make sure the Bus Chassis Number is 17 characters and Bus Number is 10 characters.');
      return; // Exit the function if character limits are not met
    }
  }

  else if (onHoldValue === "true"){
    if (!busChassisNumber || !busNumber || isNaN(busCapacity) || busCapacity <= 0) {
      alert('Please fill in all the required fields with valid data.');
      return; // Exit the function if any field is empty or invalid
    }
  
    if (busChassisNumber.length !== 17 || busNumber.length !== 10) {
      alert('Please make sure the Bus Chassis Number is 17 characters and Bus Number is 10 characters.');
      return; // Exit the function if character limits are not met
    }
  }
  

  // Fetch the selected route name from Firestore
  const routeNamesDocRef = doc(db, 'route_names', 'route_names');
  const docSnap = await getDoc(routeNamesDocRef);
  let routeSelected = null;

  if (docSnap.exists()) {
    const routeData = docSnap.data();

    for (const key in routeData) {
      if (routeData.hasOwnProperty(key)) {
        if (routeData[key] === selectedRouteName) {
          routeSelected = key;
          console.log(routeSelected);
          break;
        }
      }
    }

    if (onHoldValue === false && !routeSelected) {
      alert('Selected route name not found in the "route_names" document.');
      return;
    }
    } else {
      alert('The "route_names" document does not exist.');
      return;
    }

    // Create an object with the collected data
    const busData = {
      bus_chassis_number: busChassisNumber,
      bus_number: busNumber,
      max_capacity: busCapacity,
      route_id: onHoldValue === "true" ? null : routeSelected,
      on_hold: onHoldValue,
    };

    // Add the busData to Firestore
    const busesCollection = collection(db, 'bus_data'); // Assuming 'buses' is your Firestore collection
    const docRef = await addDoc(busesCollection, busData);

    // The document ID created in Firestore is assigned to bus_id
    const busId = docRef.id;
    busData.bus_id = busId;

    // Update the document with the bus_id
    await setDoc(doc(db, 'bus_data', busId), busData);

    // You've now added the busData to Firestore with the document ID as bus_id
    alert('Bus data pushed to Firestore successfully:', busData);
    setTimeout(() => {
      // Redirect or perform any other actions after deletion
      window.location.href="../Bus/add-bus.html"
      successMessage.style.display = 'none';
    }, 1500);
  });

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15