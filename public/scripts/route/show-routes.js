import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const routesCollection = collection(db, 'routes');

async function displayRoutes() {
  try {
    const querySnapshot = await getDocs(routesCollection);

    querySnapshot.forEach((docSnapshot) => {
      const route = docSnapshot.data();
      const routeName = route.route_name;
      const enabled=route.enabled;

      const row = document.createElement('tr');
      if(enabled===true){
        row.innerHTML = `
      <td>${routeName}</td>
      <td><a href="../Index/admin-index.html"><i class="fas fa-eye"></i></a></td>
      <td><a href="../Route/update-edit-route.html"><i class="fas fa-edit"></i></a></td>
      <td><a href="../Route/delete-route.html"><i class="fas fa-trash-alt"></i></a></td>
    `;
      }
      else{
        row.innerHTML = `
      <td>${routeName}</td>
      <td><a href="../Route/edit-route.html" style="color:red">NOT ENABLED</a></td>
      <td><a href="../Route/update-edit-route.html"><i class="fas fa-edit"></i></a></td>
      <td><a href="../Route/delete-route.html"><i class="fas fa-trash-alt"></i></a></td>
    `;
      }
      
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
