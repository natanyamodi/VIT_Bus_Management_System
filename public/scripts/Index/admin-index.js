function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 12.8406, lng: 80.1534 }, // Set the initial center of the map
    zoom: 15 // Set the initial zoom level of the map
  });

  // Function to add a marker to the map
  function addMarker(position) {
    new google.maps.Marker({
      position: position,
      map: map
    });
  }
}

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15