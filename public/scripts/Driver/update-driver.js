import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc ,addDoc, setDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

let selectedRouteKey;
let selectedBusId; // Initialize variable to store bus_id
const phoneNumberInput = document.getElementById('phoneNumber');
const phnoCounter = document.getElementById('phno-counter');

phoneNumberInput.addEventListener('input', function () {
  if (phoneNumberInput.value.length > 10) {
    phoneNumberInput.value = phoneNumberInput.value.slice(0, 10); // 
  }
  phnoCounter.textContent =` ${phoneNumberInput.value.length}/10`;
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

  const empDropdown = document.getElementById('emp-dropdown');
  const empInput = document.getElementById('emp-data-input');
  
  const driverDataDocRef = collection(db, 'driver_data'); // Replace with your actual Firestore collection name
  
  // Initialize an array to store all employee numbers
  let allEmployeeNumbers = [];
  
  // Get all documents in the "driver_data" collection
  getDocs(driverDataDocRef)
    .then((querySnapshot) => {
      // Clear the existing content in the employee number dropdown
      empDropdown.innerHTML = '';
  
      querySnapshot.forEach((doc) => {
        const employeeNumber = doc.data().employee_number;
  
        // Create a div element for each employee number with the 'emp-number-option' class
        const empDiv = document.createElement('div');
        empDiv.textContent = employeeNumber;
        empDiv.className = 'emp-number-option';
  
        // Append the div to the employee number dropdown
        empDropdown.appendChild(empDiv);
  
        // Store the employee number in the array
        allEmployeeNumbers.push(empDiv);
      });
    })
    .catch((error) => {
      console.error('Error getting documents from "driver_data" collection: ', error);
    });

// Event listener for input changes in the employee number field
empInput.addEventListener('input', function () {
  const filter = empInput.value.toLowerCase();

  // Loop through all employee number options
  allEmployeeNumbers.forEach((empNumberOption) => {
    const employeeNumber = empNumberOption.textContent.toLowerCase();
    
    if (employeeNumber.includes(filter)) {
      empNumberOption.style.display = 'block';
    } else {
      empNumberOption.style.display = 'none';
    }
  });
});
  
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
    
  // Event listener for employee number selection
  empDropdown.addEventListener('click', function (event) {
    if (event.target && event.target.className === 'emp-number-option') {
      empInput.value = event.target.textContent;
      const selectedEmployeeNumber = empInput.value;
  
      // Find the document with the matching employee number
      const employeeNumberQuery = query(driverDataDocRef, where('employee_number', '==', selectedEmployeeNumber));
      getDocs(employeeNumberQuery)
        .then((querySnapshot) => {
          if (querySnapshot.size === 1) {
            // Assuming there is exactly one matching document
            const matchingDoc = querySnapshot.docs[0];
            // Update all input fields with values from the document
            document.getElementById('name').value = matchingDoc.data().employee_name;
            const originalPhoneNumber = matchingDoc.data().phone_number;
            const phoneNumber = originalPhoneNumber.replace('+91 ', '');
            document.getElementById('phoneNumber').value = phoneNumber;
            document.getElementById('aadhar-number').value = matchingDoc.data().aadhar_number;
            const routeId = matchingDoc.data().route_id;
            document.getElementById('data-input').value = routeId;
  
            // Display the route name based on the route_id
            document.getElementById('data-input').value = routeNameMapping[routeId] || 'Route Name Not Found';
            selectedRouteKey = routeId;
            selectedBusId = matchingDoc.data().bus_id;
            document.getElementById('bus-data-input').value = matchingDoc.data().bus_number;

            const onHoldValue = matchingDoc.data().on_hold;
          document.getElementById('onHold').value = onHoldValue;

            const isOnHold = onHoldValue === "true";
            routeInput.disabled = isOnHold;
            routeInput.value = isOnHold ? "" : routeNameMapping[routeId]; // Set routeInput to routeId if not on hold
            const Roptions = document.getElementById('route-dropdown');
    if (isOnHold) {
        Roptions.style.display = 'none';
    } else {
        Roptions.style.display = ''; // Show the route-option when isOnHold is false
    }
            busNumber.disabled = isOnHold;
            busNumber.value = isOnHold ? "" : matchingDoc.data().bus_number;
            const Boptions = document.getElementById('bus-number-dropdown');
    if (isOnHold) {
        Boptions.style.display = 'none';
    } else {
        Boptions.style.display = ''; // Show the route-option when isOnHold is false
    }
            
  
            // Update other fields as needed (bus number)
          } else {
            // Clear the input fields if no document is found or multiple documents are found
            document.getElementById('name').value = '';
            document.getElementById('phoneNumber').value = '';
            document.getElementById('aadhar-number').value = '';
            document.getElementById('data-input').value = '';
            document.getElementById('bus-data-input').value = '';
            // Clear other fields as needed (route name and bus number)
          }
        })
        .catch((error) => {
          console.error('Error getting document:', error);
        });
    }
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
  
  // Get all documents in the "bus_data" collection
  getDocs(busDataDocRef)
    .then((querySnapshot) => {
      // Clear the existing content in the bus number dropdown
      busNumberDropdown.innerHTML = '';
  
      querySnapshot.forEach((doc) => {
        // Access the bus_number and route_selected fields from each document
        const busNumber = doc.data().bus_number;
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
  // ... (Your previous code)

// Event listener for route selection
routeDropdown.addEventListener('click', async function (event) {
  if (event.target && event.target.className === 'route-option') {
    const selectedRouteName = event.target.textContent;

    // Retrieve the ID (key) of the selected route from the Firestore data
    const routeNamesDocRef = doc(db, 'route_names', 'route_names');
    const docSnap = await getDoc(routeNamesDocRef);

    if (docSnap.exists()) {
      const routeData = docSnap.data();

      for (const key in routeData) {
        if (routeData[key] === selectedRouteName) {
          // Store the selected route's key
          selectedRouteKey = key;
          console.log('Selected Route ID:', selectedRouteKey);
          break;
        }
      }
    } else {
      console.error('The "route_names" document does not exist.');
    }

    // Update the input field with the selected route name
    searchInput.value = selectedRouteName;
    document.getElementById('bus-data-input').value = null; 
    selectedBusId = null;   
    // busNumber = null;
    // Filter bus numbers based on the selected route key
    filterBusNumbers(selectedRouteKey);

    // Update the Firestore document with the selected route ID
    const selectedEmployeeNumber = empInput.value;
    const employeeNumberQuery = query(driverDataDocRef, where('employee_number', '==', selectedEmployeeNumber));
    const querySnapshot = await getDocs(employeeNumberQuery);

    if (querySnapshot.size === 1) {
      const matchingDoc = querySnapshot.docs[0];
      const onHoldValue = matchingDoc.data().on_hold;
      // Update the document with the new route ID
      console.log(selectedRouteKey)
      // const newData = {
      //   route_id: document.getElementById('onHold') === "true" ? null : selectedRouteKey,
      // };

      try {
        await setDoc(matchingDoc.ref, newData, { merge: true });
        console.log('Route ID updated successfully.');
      } catch (error) {
        console.error('Error updating route ID:', error);
      }
    } else {
      console.error('Error updating route ID: No matching document found.');
    }
  }
});

// ... (The rest of your code)

  


// Event listener for bus number selection
busNumberDropdown.addEventListener('click', async function (event) {
  if (event.target && event.target.className === 'bus-number-option') {
    const selectedBusNumber = event.target.textContent;

    // Fetch the bus data based on the selected bus number
    const busDataQuery = collection(db, 'bus_data');
    try {
      const querySnapshot = await getDocs(busDataQuery);
      querySnapshot.forEach((doc) => {
        const busNumber = doc.data().bus_number;
        if (busNumber === selectedBusNumber) {
          selectedBusId = doc.data().bus_id; // Retrieve bus_id for the selected bus number
          // Perform any other actions with selectedBusId
        }
      });
    } catch (error) {
      console.error('Error fetching bus data:', error);
    }

    busNumberInput.value = selectedBusNumber;
    // Hide the dropdown (you may want to add code for this)
  }
});



const onHoldSelect = document.getElementById('onHold');
const routeInput = document.getElementById('data-input');
let busNumber = document.getElementById('bus-data-input');
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



const submitButton = document.querySelector('.submit');
let successMessage = document.getElementById('success-message');

// Function to set the Aadhar input field value
function setAadharValue(aadhar) {
  aadharInput.value = aadhar;
}

// Event listener for employee number selection
empInput.addEventListener('input', async () => {
  const selectedEmployeeNumber = empInput.value;

  // Find the document with the matching employee number
  const employeeNumberQuery = query(driverDataDocRef, where('employee_number', '==', selectedEmployeeNumber));
  const querySnapshot = await getDocs(employeeNumberQuery);

  if (querySnapshot.size === 1) {
    // Assuming there is exactly one matching document
    const matchingDoc = querySnapshot.docs[0];

    // Get the existing "aadhar" value from the document
    const existingAadhar = matchingDoc.data().aadhar;

    // Set the Aadhar input field value
    setAadharValue(existingAadhar);
  } else {
    // Clear the value of the Aadhar input field if no document is found or multiple documents are found
    setAadharValue('');
  }
});

submitButton.addEventListener('click', async () => {
  const selectedEmployeeNumber = empInput.value;

  // Find the document with the matching employee number
  const employeeNumberQuery = query(driverDataDocRef, where('employee_number', '==', selectedEmployeeNumber));
  const querySnapshot = await getDocs(employeeNumberQuery);

  successMessage.textContent = '';

  if (querySnapshot.size === 1) {
    // Assuming there is exactly one matching document
    const matchingDoc = querySnapshot.docs[0];

    // Get the new values from the input fields
    const name = document.getElementById('name').value;
    let phoneNumber = document.getElementById('phoneNumber').value;
    const aadhar = document.getElementById('aadhar-number').value;
    const routeId = selectedRouteKey;
    const busNumber = busNumberInput.value;
    const onHoldValue = onHoldSelect.value;
    phoneNumber = `+91 ${phoneNumber}`

    if (selectedBusId === null && onHoldValue === "false"){
      alert('there is no bus assigned to that route')
    }
    else{
      const newData = {
        employee_name: name,
        phone_number: phoneNumber,
        aadhar_number: aadhar,
        route_id: onHoldValue === "true" ? null : selectedRouteKey,
        bus_number: onHoldValue === "true" ? null : busNumber,
        on_hold: onHoldValue,
        bus_id: onHoldValue === "true" ? null : selectedBusId,
      };
  
      try {
        await setDoc(matchingDoc.ref, newData, { merge: true });
        successMessage.textContent = 'Document updated successfully.';
        setTimeout(() => {
          window.location.href='../Driver/update-driver.html';
        }, 2000);
      } catch (error) {
        console.error('Error updating document:', error);
      }
    }
    // Update the document with the new values
    
  } else if (querySnapshot.size === 0) {
    alert('No document found with the selected employee number.');
  } else {
    console.error('Multiple documents found with the same employee number. Please handle this case as needed.');
  }
});

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15