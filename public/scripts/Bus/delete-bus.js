import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc ,addDoc, setDoc,  query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const busNumberDropdown = document.getElementById('bus-number-dropdown');
const busNumberInput = document.getElementById('bus-data-input');

const busDataDocRef = collection(db, 'bus_data');


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


let selectedBusNumber ;
// Event listener for bus number selection
// Event listener for bus number selection
busNumberDropdown.addEventListener('click', async function (event) {
  if (event.target && event.target.className === 'bus-number-option') {
    const selectedBusNumber = event.target.textContent;

    // Fetch the details of the selected bus
    const busDetails = await getBusDetails(selectedBusNumber);
    busNumberInput.value = selectedBusNumber;
    // Update the bus-data div with the bus details
    console.log(busDetails)
    updateBusDataDiv(busDetails);
    
  }
});

// Function to get the details of a bus based on its bus number
async function getBusDetails(selectedBusNumber) {
  const querySnapshot = await getDocs(collection(db, 'bus_data'));

  for (const doc of querySnapshot.docs) {
    const busData = doc.data();
    if (busData.bus_number === selectedBusNumber) {
      const routeId = busData.route_id;
      const routeName = await getRouteName(routeId);

      return {
        busChassisNumber: busData.bus_chassis_number,
        routeId: routeId,
        routeName: routeName
      };
    }
  }

  // If the bus is not found, you can return some default values or handle it as needed.
  return {
    busChassisNumber: 'N/A',
    routeId: 'N/A',
    routeName: 'N/A'
  };
}

// Function to get the route name from the 'route_names' collection
async function getRouteName(routeId) {
  const routeNameDoc = doc(db, 'route_names', 'route_names'); // Access the 'cad' document in the 'route_names' collection

  try {
    const routeNameDocSnapshot = await getDoc(routeNameDoc);
    if (routeNameDocSnapshot.exists()) {
      const routeNameData = routeNameDocSnapshot.data();

      // Check if the specified routeId exists in the data
      if (routeNameData[routeId]) {
        return routeNameData[routeId]; // Return the route name associated with the specified routeId
      } else {
        return 'N/A'; // Return 'N/A' if the routeId is not found in the data
      }
    }
  } catch (error) {
    console.error('Error fetching route name:', error);
  }

  return 'N/A'; // Default value if the document is not found or if there's an error.
}


// Function to update the bus-data div with the bus details, including the route name
function updateBusDataDiv(busDetails) {
  const busDataDiv = document.getElementById('bus-data');
  busDataDiv.innerHTML = `
    <p>Bus Chassis Number: ${busDetails.busChassisNumber}</p>
    <p>Route ID: ${busDetails.routeId}</p>
    <p>Route Name: ${busDetails.routeName}</p>
  `;
}




// Event listener for bus number filtering
busNumberInput.addEventListener('input', function () {
  const filterText = busNumberInput.value.toLowerCase();

  allBusNumberOptions.forEach((busDiv) => {
    const busNumber = busDiv.textContent.toLowerCase();

    if (busNumber.includes(filterText)) {
      busDiv.style.display = 'block';
    } else {
      busDiv.style.display = 'none';
    }
  });
});



const deleteButton = document.getElementById('submit-delete');
const deleteConfirmation = document.getElementById('deleteConfirmation');
const confirmDeleteButton = document.getElementById('confirmDelete');
const cancelDeleteButton = document.getElementById('cancelDelete');
const successMessage = document.getElementById('success-message');

// Initially hide the delete confirmation popup
deleteConfirmation.style.display = 'none';

let selectedBusId = ''; // Variable to store the selected bus ID

// Add event listener for the "Delete Bus" button
deleteButton.addEventListener('click', function () {
  // Show the confirmation popup
  deleteConfirmation.style.display = 'block';
});

// Add event listener for the "Yes" button in the confirmation popup
confirmDeleteButton.addEventListener('click', async function () {
  selectedBusNumber=document.getElementById('bus-data-input').value;
  console.log(selectedBusNumber)
  // Check if a bus number is selected
  if (!selectedBusNumber) {
    console.error('No bus number is selected.');
    return;
  }

  // Find the bus document with the selected bus number and delete it
  const querySnapshot = await getDocs(collection(db, 'bus_data'));
  let busDocumentId = null;

  querySnapshot.forEach((doc) => {
    const busData = doc.data();
    if (busData.bus_number === selectedBusNumber) {
      busDocumentId = doc.id;
    }
  });

  const driverDataCollectionRef = collection(db, "driver_data");
    const driversQuery = query(
      driverDataCollectionRef,
      where("bus_number", "==", selectedBusNumber)
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

  if (busDocumentId) {
    await deleteDoc(doc(db, 'bus_data', busDocumentId));
    successMessage.textContent = 'Bus deleted successfully.';
    successMessage.style.display = 'block';
    setTimeout(() => {
      // Redirect or perform any other actions after deletion
      window.location.href="../Bus/delete-bus.html"
      successMessage.style.display = 'none';
    }, 1500);
  }

  // Hide the confirmation popup
  deleteConfirmation.style.display = 'none';
});

// Add event listener for the "No" button in the confirmation popup
cancelDeleteButton.addEventListener('click', function () {
  // Hide the confirmation popup
  deleteConfirmation.style.display = 'none';
});

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15