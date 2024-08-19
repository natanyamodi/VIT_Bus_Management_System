import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc ,addDoc, setDoc, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);


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

const driverDetailsElement = document.getElementById('driver-details');

// Event listener for employee number selection
empDropdown.addEventListener('click', async function (event) {
  if (event.target && event.target.className === 'emp-number-option') {
    empInput.value = event.target.textContent;
    const selectedEmployeeNumber = empInput.value;

    // Find the document with the matching employee number
    const employeeNumberQuery = query(driverDataDocRef, where('employee_number', '==', selectedEmployeeNumber));
    const querySnapshot = await getDocs(employeeNumberQuery);

    if (querySnapshot.size === 1) {
      // Assuming there is exactly one matching document
      const matchingDoc = querySnapshot.docs[0];

      // Update the "driver-details" element with driver information
      driverDetailsElement.innerHTML = `
        <p>Name: ${matchingDoc.data().employee_name}</p>
        <p>Phone Number: ${matchingDoc.data().phone_number}</p>
        <p>Bus Number: ${matchingDoc.data().bus_number}</p>
        <p>Route ID: ${matchingDoc.data().route_id}</p>
      `;
    } else {
      // Clear the "driver-details" element if no document is found or multiple documents are found
      driverDetailsElement.innerHTML = '';
    }
  }
});

let successMessage = document.getElementById('success-message');
const submitButton = document.querySelector('.submit');

submitButton.addEventListener('click', async () => {
  const selectedEmployeeNumber = empInput.value;
  successMessage.textContent = '';
  // Find the document with the matching employee number
  const employeeNumberQuery = query(driverDataDocRef, where('employee_number', '==', selectedEmployeeNumber));
  const querySnapshot = await getDocs(employeeNumberQuery);

  if (querySnapshot.size === 1) {
    // Assuming there is exactly one matching document
    const matchingDoc = querySnapshot.docs[0];

    try {
      // Delete the Firestore document with the selected employee number
      await deleteDoc(matchingDoc.ref);
      successMessage.textContent = 'Document deleted successfully.';
      document.getElementById('emp-data-input').value='';
      setTimeout(() => {
        window.location.href='../Driver/delete-driver.html';
      }, 2000);
      // Clear the "driver-details" element
      driverDetailsElement.innerHTML = '';
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  } else if (querySnapshot.size === 0) {
    alert('No document found with the selected employee number.');
  } else {
    console.error('Multiple documents found with the same employee number. Please handle this case as needed.');
  }
});

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15