import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc ,addDoc, setDoc,  query, where } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const EmpNoInput = document.getElementById('emp-no');
const EmpNoCounter = document.getElementById('emp-no-counter');

EmpNoInput.addEventListener('input', function () {
    const currentLength = EmpNoInput.value.length;
    EmpNoCounter.textContent = `${currentLength}/5`;
});

const phoneNumberInput = document.getElementById('phoneNumber');
const phnoCounter = document.getElementById('phno-counter');

phoneNumberInput.addEventListener('input', function () {
  if (phoneNumberInput.value.length > 10) {
    phoneNumberInput.value = phoneNumberInput.value.slice(0, 10); // 
  }
  phnoCounter.textContent = `${phoneNumberInput.value.length}/10`;
});

const aadharInput = document.getElementById('aadhar-number');
  const aadharCounter = document.getElementById('aadhar-counter');

  // Add an input event listener to the Aadhar input field
  aadharInput.addEventListener('input', function() {
    // Get the current input value's length
    if (aadharInput.value.length > 10) {
      aadharInput.value = aadharInput.value.slice(0, 12); // 
    }
    aadharCounter.textContent = `${aadharInput.value.length}/12`;
  });


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
          break;
        }
      }
    } else {
      console.error('The "route_names" document does not exist.');
    }
  }
  });



// Initialize Firebase and Firestore here


const busNumberDropdown = document.getElementById('bus-number-dropdown');
const busNumberInput = document.getElementById('bus-data-input');

const busDataDocRef = collection(db, 'bus_data');

// Function to filter and display bus number options based on route_selected ID
function filterBusNumbers(routeId) {
  for (const busNumberOption of allBusNumberOptions) {
    const routeSelected = busNumberOption.getAttribute('data-route-selected');

    if (routeSelected === routeId) {
      busNumberOption.style.display = 'block';
    } else {
      busNumberOption.style.display = 'none';
    }
  }
}

// Initialize an array to store all bus number options
let allBusNumberOptions = [];
let busId;
// Get all documents in the "bus_data" collection
getDocs(busDataDocRef)
  .then((querySnapshot) => {
    // Clear the existing content in the bus number dropdown
    busNumberDropdown.innerHTML = '';

    querySnapshot.forEach((doc) => {
      // Access the bus_number and route_selected fields from each document
      const busNumber = doc.data().bus_number;
      busId = doc.data().bus_id
      const routeSelected = doc.data().route_id;

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
          break;
        }
      }
    } else {
      console.error('The "route_names" document does not exist.');
    }

    // Filter bus numbers based on the selected route key
    filterBusNumbers(selectedRouteKey);
  }
});

let selectedBusNumber = ''
// Event listener for bus number selection
busNumberDropdown.addEventListener('click', function (event) {
  if (event.target && event.target.className === 'bus-number-option') {
    busNumberInput.value = event.target.textContent;
    selectedBusNumber = event.target.textContent;
    // Hide the dropdown (you may want to add code for this)
  }
});


const addButton = document.querySelector('.submit');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

const onHoldSelect = document.getElementById('onHold');
const routeInput = document.getElementById('data-input');
const busNumber = document.getElementById('bus-data-input');
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

  busNumber.disabled = isOnHold;
  const allBusNumberOptions = document.getElementById('bus-number-dropdown');
      if (isOnHold) {
          allBusNumberOptions.style.display = 'none';
      } else {
          allBusNumberOptions.style.display = ''; // Show the busNumberOption when isOnHold is false
      }
  busNumber.value = isOnHold ? "" : "";
});


addButton.addEventListener('click', async function () {
  // Get the values from the input fields

  errorMessage.textContent = '';
  successMessage.textContent = '';

  const empName = document.getElementById('name').value;
  const empNumber = document.getElementById('emp-no').value;
  let phoneNumber = document.getElementById('phoneNumber').value;
  const routeInput = document.getElementById('data-input').value;
  const busNumber = document.getElementById('bus-data-input').value;
  const aadharNumber = document.getElementById('aadhar-number').value;
  const onHoldValue = onHoldSelect.value;
  phoneNumber = `+91 ${phoneNumber}`

  // Check if any of the input fields are empty or not completely filled
  if (onHoldValue === "false"){
    if (!empName || !empNumber || !phoneNumber || !routeInput || !busNumber || !aadharNumber) {
      alert('Please fill in all the required fields with valid data.');
      return; // Exit the function if any field is empty or invalid
    }
  } else if (onHoldValue === "true"){
    if (!empName || !empNumber || !phoneNumber || !aadharNumber) {
      alert('Please fill in all the required fields with valid data.');
      return; // Exit the function if any field is empty or invalid
    }
  }


  

  // Check if the character limits have been reached
  if (empNumber.length !== 5 || phoneNumber.length !== 14 || aadharNumber.length !== 12) {
    alert('Please make sure the Employee Number is 5 characters, Phone Number is 10 characters, and Aadhar Number is 12 characters.');
    return; // Exit the function if character limits are not met
  }


  // Check if route name or bus number already exists in Firestore
  const driversCollection = collection(db, 'driver_data');
  const querySnapshot = await getDocs(driversCollection);

  let isRouteNameTaken = false;
  let isBusNumberTaken = false;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.route_id === routeInput) {
      isRouteNameTaken = true;
    }
    if (data.bus_number === busNumber) {
      isBusNumberTaken = true;
    }
  });

  if (isRouteNameTaken || isBusNumberTaken) {
    // Display an error message
    errorMessage.textContent = 'Driver already exists with the chosen route name and bus number';
    document.getElementById('data-input').value = '';
    document.getElementById('bus-data-input').value = '';
    return;
  }

  // Clear the input fields
  document.getElementById('name').value = '';
  document.getElementById('emp-no').value = '';
  document.getElementById('phoneNumber').value = '';
  document.getElementById('data-input').value = '';
  document.getElementById('bus-data-input').value = '';
  document.getElementById('aadhar-number').value = '';

  // Fetch the selected route name from Firestore
  const routeNamesDocRef = doc(db, 'route_names', 'route_names');
  const docSnap = await getDoc(routeNamesDocRef);
  let routeSelected = null;

  if (docSnap.exists()) {
    const routeData = docSnap.data();

    for (const key in routeData) {
      if (routeData[key] === routeInput) {
        routeSelected = key;
        console.log(routeSelected);
        break;
      }
    }


  if (onHoldValue === "false" && !routeSelected) {
    alert('Selected route name not found in the "route_names" document.');
    return;
  }
  } else {
    alert('The "route_names" document does not exist.');
    return;
  }

  // Create an object with the collected data
  const driverData = {
    employee_name: empName,
    employee_number: empNumber,
    phone_number: phoneNumber,
    aadhar_number: aadharNumber,
    route_id: onHoldValue === "true" ? null : routeSelected,
    bus_number: onHoldValue === "true" ? null : busNumber,
    bus_id: onHoldValue === "true" ? null : busId,
    on_hold: onHoldValue,
  };

  // Add the driverData to Firestore
  const docRef = await addDoc(driversCollection, driverData);

  // The document ID created in Firestore is assigned to driver_id field
  const driverId = docRef.id;
  driverData.driver_id = driverId;

  // Update the document with the driver_id
  await setDoc(doc(db, 'driver_data', driverId), driverData);

  // Display a success message
  successMessage.textContent = 'Data submitted successfully!';
  setTimeout(() => {
    // Redirect or perform any other actions after deletion
    window.location.href="../Driver/add-driver.html"
    successMessage.style.display = 'none';
  }, 1500);
});

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15