import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const driverCollection = collection(db, 'driver_data');

async function displayDrivers() {
  try {
    const querySnapshot = await getDocs(driverCollection);

    querySnapshot.forEach((docSnapshot) => {
      const driver = docSnapshot.data();
      const Name = driver.employee_name;

      const row = document.createElement('tr');
      row.innerHTML = `
      <td>${Name}</td>
      <td><a href="../Driver/view-driver.html"><i class="fas fa-eye"></i></a></td>
      <td><a href="../Driver/update-driver.html"><i class="fas fa-edit"></i></a></td>
      <td><a href="../Driver/delete-driver.html"><i class="fas fa-trash-alt"></i></a></td>
    `;
    
      // Assuming you have a table body element with the id 'routesTableBody'
      const routesTableBody = document.getElementById('routesTableBody');
      routesTableBody.appendChild(row);
    });

  } catch (error) {
    console.error('Error getting routes:', error);
  }
}

// Call the function to display routes
displayDrivers();
