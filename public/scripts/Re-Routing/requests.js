
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let requestId;
// Function to read data from Firestore.
async function readDataFromFirestore() {
  try {
    const notificationsRef = collection(db, 'notifications');
    const querySnapshot = await getDocs(notificationsRef);
    const studentsContainer = document.querySelector('.students-container');

    querySnapshot.forEach((docSnapshot) => {
      const BusData = docSnapshot.data();
      if (BusData.emergency === true && BusData.bus_id ) {

        if( BusData.rerouted_bus_id && BusData.rerouted_bus_id.length !== 0){
        let reroutedDetails = '';

        for (let i = 0; i < BusData.rerouted_bus_id.length; i++) {
          reroutedDetails += `
            <div class="re-detail">
              <div class="Hading">Re-Routed Bus ${i + 1}: &nbsp; ${BusData.rerouted_bus_routes
                [i]}</div>
              <div class="bus-num"> Bus Number:${BusData.emergency_bus_numbers[i]}</div>
            </div>
          `;
        }

        const BusDetails = `
          <div class="requests-window">
            <div class="detail-container">
              <div class="detail">
                <div class="Hading-Det">Broken Bus: ${BusData.route_name}</div>
                <div>Broken Bus ID: ${BusData.bus_id}</div>
                <div>Broken Bus Number: ${BusData.bus_number}</div>
                <div>Driver Name: ${BusData.employee_name}</div>
                <div>Driver Phone: ${BusData.phone_number}</div>
              </div>
              <div class="re-detail">
                <div class="Hading">Re-Routed Buses:  &nbsp; YES!</div>
                <br>
                ${reroutedDetails}
              </div>
              <div class="check-emergency" data-requestId="${docSnapshot.id}">
                Acknowledge
              </div>
            </div>
          </div>
        `;
        studentsContainer.insertAdjacentHTML('beforeend', BusDetails);
        requestId=docSnapshot.id
      }
      // <div> Bus ID: ${BusData.rerouted_bus_id[i]}</div>
      // <div> original RouteId: ${BusData.rerouted_route_id[i]}</div>
      else if ( BusData.rerouted_route_id && BusData.rerouted_route_id.length === 0
        ) {
          const BusDetails = `
            <div class="requests-window">
              <div class="detail-container">
                <div class="detail">
                  <div class="Hading-Det">Broken Bus: ${BusData.route_name}</div>
                  <div>Broken Bus ID: ${BusData.bus_id}</div>
                  <div>Broken Bus Number: ${BusData.bus_number}</div>
                  <div>Driver Name: ${BusData.employee_name}</div>
                  <div>Driver Phone: ${BusData.phone_number}</div>
                </div>
                <div class="re-detail">
                  <div class="no-Hading">Re-Routed Buses:  &nbsp; NO!!!</div>
                  <div class="no-Hading">Please contact the driver personally.</div>
                </div>
                <div class="check-emergency" data-requestId="${docSnapshot.id}">
                Acknowledge 
              </div>
              </div>
            </div>
          `;
          studentsContainer.insertAdjacentHTML('beforeend', BusDetails);
          requestId=docSnapshot.id
        }
      }
    });
  } catch (error) {
    console.error("Error reading data from Firestore:", error);
  }
}

document.querySelector('.requests-tab').addEventListener('click', () => {
  window.location.href = '../Re-Routing/history.html'; // Redirect to history.html
});


// Call the function to read data and attach event listeners
try {
  document.addEventListener("DOMContentLoaded", () => {
    readDataFromFirestore();
  });

  document.querySelector('.students-container').addEventListener('click', async (event) => {
    if (event.target.classList.contains('check-emergency')) {
      try {
        const requestId = event.target.getAttribute('data-requestId'); // Assuming requestId is stored as an attribute
  
        const notificationsRef = doc(db, 'notifications', requestId);
        const notificationsDoc = await getDoc(notificationsRef);
  
        if (notificationsDoc.exists()) {
          // Move the data to reRoutingHistory collection
          const reRoutingHistoryCollection = collection(db, 'reRoutingHistory');
          const data = notificationsDoc.data();
  
          const reRoutingDocRef = doc(db, 'reRoutingHistory', requestId);
          await setDoc(reRoutingDocRef, data); // Save to reRoutingHistory
  
          // Delete the document from the notifications collection
          await deleteDoc(notificationsRef);

           // Success alert after successful deletion
        window.alert('Route Change Request Has Been Acknowledged');
  
          // Remove the request div from the page
          event.target.closest('.requests-window').remove();
        }
      } catch (error) {
        console.error("Error handling Firestore documents:", error);
      }
    }
  });
  
} catch (error) {
  console.error("Error:", error);
}
// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15