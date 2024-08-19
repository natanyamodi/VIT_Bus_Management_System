import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const BusCollection = collection(db, 'bus_data');

async function displayRoutes() {
  try {
    const querySnapshot = await getDocs(BusCollection);

    querySnapshot.forEach((docSnapshot) => {
      const Bus = docSnapshot.data();
      const BusNo = Bus.bus_number;

      const row = document.createElement('tr');
      row.innerHTML = `
      <td>${BusNo}</td>
      <td><a href="../Bus/view-buses.html"><i class="fas fa-eye"></i></a></td>
      <td><a href="../Bus/update-bus.html"><i class="fas fa-edit"></i></a></td>
      <td><a href="../Bus/delete-bus.html"><i class="fas fa-trash-alt"></i></a></td>
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
displayRoutes();
