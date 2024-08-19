import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, doc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const stopsCollection = collection(db, 'stops');

const stopInput = document.getElementById('stop');
const autocomplete = new google.maps.places.Autocomplete(stopInput);

autocomplete.addListener('place_changed', function () {
  const selectedPlace = autocomplete.getPlace();

  if (selectedPlace.geometry) {
    const latInput = document.getElementById('stop-lat');
    const lngInput = document.getElementById('stop-lng');
    latInput.value = selectedPlace.geometry.location.lat();
    lngInput.value = selectedPlace.geometry.location.lng();
  }
});

const successMessage = document.getElementById('success-message');
document.getElementById('save-stop').addEventListener('click', async function (event) {
  event.preventDefault();

  const stopName = document.getElementById('stop').value;
  const stopLat = document.getElementById('stop-lat').value;
  const stopLng = document.getElementById('stop-lng').value;

  const errorMessageElement = document.getElementById('error-message');
  errorMessageElement.textContent = '';
  successMessage.textContent = '';

  if (stopName && stopLat && stopLng) {
    const stopData = {
      latitude: parseFloat(stopLat),
      longitude: parseFloat(stopLng),
      name: stopName,
    };

    const querySnapshot = await getDocs(query(collection(db, 'stops'), where('name', '==', stopName)));

    if (!querySnapshot.empty) {
      errorMessageElement.textContent = 'Stop already exists.';
      return; // Exit the function to prevent adding a duplicate stop
    }

    try {
      const docRef = await addDoc(stopsCollection, stopData);
      const stopId = docRef.id;
      const marker = new google.maps.Marker({
        position: { lat: parseFloat(stopLat), lng: parseFloat(stopLng) },
        map: map,
        title: stopName,
      });
      map.panTo(marker.getPosition());
      map.setZoom(17);
      const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${stopLat},${stopLng}&key=AIzaSyBzZugl8OoPpi2id4j975QuGkiJLQH3pmE`;
      const response = await fetch(geocodingUrl);
      const data = await response.json();

      if (data.status === "OK") {
        const placeId = data.results[0].place_id;
        await updateDoc(doc(stopsCollection, stopId), {
          stop_id: stopId,
          place_id: placeId,
        });
        console.log('Stop added to Firestore:', {
          latitude: parseFloat(stopLat),
          longitude: parseFloat(stopLng),
          name: stopName,
          place_id: placeId,
          stop_id: stopId,
        });
        document.getElementById('stop').value = '';
        document.getElementById('stop-lat').value = '';
        document.getElementById('stop-lng').value = '';
          // Display a success message
  successMessage.textContent = 'Data submitted successfully!';


      } else {
        console.error('Failed to retrieve place_id from Google Maps Geocoding API');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  } else {
    errorMessageElement.textContent = 'Please select a valid stop location.';
  }
});

let map;
map = new google.maps.Map(document.getElementById('map'), {
  center: { lat: 12.8406, lng: 80.1534 },
  zoom: 15,
});

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15