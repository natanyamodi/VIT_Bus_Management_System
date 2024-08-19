import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc ,addDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const busChassisNumberInput = document.getElementById('bus-chassis-number');
const busChassisNumberCounter = document.getElementById('bus-chassis-number-counter');

const busNumberCounter = document.getElementById('bus-number-counter');

const busCapacityInput = document.getElementById('bus-capacity');
const busCapacityCounter = document.getElementById('bus-capacity-counter');


busChassisNumberInput.addEventListener('input', function () {
    const currentLength = busChassisNumberInput.value.length;
    busChassisNumberCounter.textContent =` ${currentLength}/17`;
});



busCapacityInput.addEventListener('input', function () {
  // Ensure that the input value doesn't exceed 2 digits
  if (busCapacityInput.value.length > 2) {
    busCapacityInput.value = busCapacityInput.value.slice(0, 2); // Truncate to 2 digits
  }
  
  // Update the counter with the current length (up to 2 digits)
  busCapacityCounter.textContent =` ${busCapacityInput.value.length}/2`;
});

const busNumberDropdown = document.getElementById('bus-number-dropdown');
  const busNumberInput = document.getElementById('bus-data-input');
  
  const busDataDocRef = collection(db, 'bus_data');
  
  // Function to filter and display bus number options based on route_selected ID
  // function filterBusNumbers(routeId) {
  //   for (const busNumberOption of allBusNumberOptions) {
  //     const routeSelected = busNumberOption.getAttribute('data-route-selected');
  
  //     if (routeSelected === routeId) {
  //       busNumberOption.style.display = 'block';
  //     } else {
  //       busNumberOption.style.display = 'none';
  //     }
  //   }
  // }
  
  // Initialize an array to store all bus number options
  let allBusNumberOptions = [];
  let routeSelected;
  // Get all documents in the "bus_data" collection
  getDocs(busDataDocRef)
    .then((querySnapshot) => {
      // Clear the existing content in the bus number dropdown
      busNumberDropdown.innerHTML = '';
  
      querySnapshot.forEach((doc) => {
        // Access the bus_number and route_selected fields from each document
        const busNumber = doc.data().bus_number;
        routeSelected = doc.data().route_id;
        console.log(routeSelected)
        
  
        // Create a div element for each bus number with the 'bus-number-option' class
        const busDiv = document.createElement('div');
        busDiv.textContent = busNumber;
        busDiv.className = 'bus-number-option';
  
        // Set the data attribute to store the route_selected value (ID)
        busDiv.setAttribute('data-route-selected', routeSelected);
  
        // Append the div to the bus number dropdown
        busNumberDropdown.appendChild(busDiv);
  
        // Store the bus number option in the array
        allBusNumberOptions.push(busDiv);
      });
    })
    .catch((error) => {
      console.error('Error getting documents from "bus_data" collection: ', error);
    });
  
// Event listener for route selection

const routeNameMapping = {};

function fetchRouteNames() {
  const routeNamesDocRef = doc(db, 'route_names', 'route_names');
  getDoc(routeNamesDocRef)
    .then((docSnapshot) => {
      if (docSnapshot.exists()) {
        const routeData = docSnapshot.data();

        for (const key in routeData) {
          routeNameMapping[key] = routeData[key];
        }
      } else {
        console.error('The "route_names" document does not exist.');
      }
    })
    .catch((error) => {
      console.error('Error getting the "route_names" document: ', error);
    });
}

// Call this function to fetch route names when the page loads
fetchRouteNames();
  
  let selectedBusNumber = ''
  // Event listener for bus number selection
busNumberDropdown.addEventListener('click', async function (event) {
  if (event.target && event.target.className === 'bus-number-option') {
    busNumberInput.value = event.target.textContent;
    selectedBusNumber = event.target.textContent;
    // Hide the dropdown (you may want to add code for this)
    const busDataQuery = collection(db, 'bus_data');
    try {
      const querySnapshot = await getDocs(busDataQuery);
      let selectedBusData = null;

      querySnapshot.forEach((doc) => {
        const busNumber = doc.data().bus_number;

        if (busNumber === selectedBusNumber) {
          selectedBusData = doc.data();
        }
      });

      // Check if a matching document was found
      if (selectedBusData) {
        // Fill in the remaining values in the form
        document.getElementById('bus-chassis-number').value = selectedBusData.bus_chassis_number;
        // Uncomment the line below to fill in the bus number
        // document.getElementById('bus-number').value = selectedBusData.bus_number;
        document.getElementById('bus-capacity').value = selectedBusData.max_capacity;

        // Display the route name based on the route_id
        const routeInput = document.getElementById('route-input');
        routeInput.value = routeNameMapping[selectedBusData.route_id] || 'Route Name Not Found';

        // Set onHoldValue and configure related fields
        const onHoldValue = selectedBusData.on_hold;
        console.log(onHoldValue);
        document.getElementById('onHold').value = onHoldValue;
        const isOnHold = onHoldValue === "true";
        routeInput.disabled = isOnHold;
        routeInput.value = isOnHold ? "" : routeNameMapping[selectedBusData.route_id]; // Set routeInput to routeId if not on hold
        const Roptions = document.getElementById('route-dropdown');
    if (isOnHold) {
        Roptions.style.display = 'none';
    } else {
        Roptions.style.display = ''; // Show the route-option when isOnHold is false
    }

      } else {
        alert('Bus data not found for the selected bus number.');
      }
    } catch (error) {
      console.error('Error fetching bus data:', error);
    }
  }
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

    // Find the corresponding route ID for the selected route name
    for (const key in routeNameMapping) {
      if (routeNameMapping[key] === selectedRouteName) {
        routeSelected = key; // Assign the corresponding route ID to routeSelected
        break; // Exit the loop once a match is found
      }
    }
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
  const busNumber = selectedBusNumber;
  const busCapacity = parseInt(document.getElementById('bus-capacity').value, 10); // Parse as an integer
  const routeInput = document.getElementById('route-input').value;
  const onHoldValue = onHoldSelect.value;

  // Check if any of the input fields are empty
  if (onHoldValue === "false") {
    if (!busChassisNumber || !busNumber || isNaN(busCapacity) || busCapacity <= 0 || !routeInput) {
      alert('Please fill in all the required fields with valid data.');
      return; // Exit the function if any field is empty or invalid
    }

    if (busChassisNumber.length !== 17 || busNumber.length !== 10) {
      alert('Please make sure the Bus Chassis Number is 17 characters and Bus Number is 10 characters.');
      return; // Exit the function if character limits are not met
    }
  } else if (onHoldValue === "true") {
    if (!busChassisNumber || !busNumber || isNaN(busCapacity) || busCapacity <= 0) {
      alert('Please fill in all the required fields with valid data.');
      return; // Exit the function if any field is empty or invalid
    }

    if (busChassisNumber.length !== 17 || busNumber.length !== 10) {
      alert('Please make sure the Bus Chassis Number is 17 characters and Bus Number is 10 characters.');
      return; // Exit the function if character limits are not met
    }
  }

  // Fetch the selected bus data from Firestore
  const busDataQuery = collection(db, 'bus_data');
  try {
    const querySnapshot = await getDocs(busDataQuery);
    let selectedBusDocId = null;

    querySnapshot.forEach((doc) => {
      const busNumberInFirestore = doc.data().bus_number;

      if (busNumberInFirestore === selectedBusNumber) {
        selectedBusDocId = doc.id;
      }
    });

    // Check if a matching document was found
    if (selectedBusDocId) {
      // Create an object with the collected data
      const busData = {
        bus_chassis_number: busChassisNumber,
        bus_number: busNumber,
        max_capacity: busCapacity,
        route_id: onHoldValue === "true" ? null : routeSelected,
        on_hold: onHoldValue,
      };

      // Update the selected busData in Firestore with merge=true
      await setDoc(doc(db, 'bus_data', selectedBusDocId), busData, { merge: true });

      // You've now updated the selected busData in Firestore
      alert('Bus data updated in Firestore successfully:', busData);
      setTimeout(() => {
        // Redirect or perform any other actions after updating
        window.location.href = "../Bus/update-bus.html";
        successMessage.style.display = 'none';
      }, 1500);
    } else {
      alert('Bus data not found for the selected bus number.');
    }
  } catch (error) {
    console.error('Error updating bus data:', error);
  }
});

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15