/*
function toggle() {
  document.querySelector(".dropdown-content").classList.toggle("show");
}
*/

function toggle() {
  var dropdown = document.querySelector('.dropdown-content');
  if (dropdown) {
    dropdown.classList.toggle('selected');
  }
}

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.querySelector(".my-input");
  filter = input.value.toUpperCase();
  div = document.querySelector(".dropdown-content");
  a = div.getElementsByTagName("a");

  for (i = 0; i <a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}



/*
function selectBus(busNumber) {
  toggle();
  var selectedBus = 'bus-' + busNumber;

  // Iterate through stored polyline references
  for (let i = 0; i < polylineReferences.length; i++) {
    var polyline = polylineReferences[i];

    // Extract the bus number from the polyline's ID or name
    var polylineBusNumber = i + 1;

    // Set visibility based on whether it matches the selected bus
    if (selectedBus === 'bus-' + polylineBusNumber) {
      polyline.setMap(map);
      selectedBusPolyline = polyline; // Store the selected polyline
    } else {
      polyline.setMap(null);
    }
  }
  
  // Ensure that the selected polyline is always visible
  if (selectedBusPolyline!=null) {
    selectedBusPolyline.setMap(map);
  }
}
*/
/*
function selectBus(busNumber) {
  toggle();
  var selectedBus = 'bus-' + busNumber;

  // Iterate through stored polyline references
  for (let i = 0; i < polylineReferences.length; i++) {
    var polyline = polylineReferences[i];
    // Extract the bus number from the polyline's ID or name
    var polylineBusNumber = i + 1;

    // Check if the polyline matches the selected bus
    if (selectedBus === 'bus-' + polylineBusNumber) {
      polyline.setMap(map); // Show the selected polyline
      map.fitBounds(polyline.getBounds()); // Zoom to the selected polyline
    } else {
      polyline.setMap(null); // Hide all other polylines
    }
  }
}
*/

/*
function selectBus(busNumber) {
  let selectedBusPolyline = null;
  toggle();
  var selectedBus = 'bus-' + busNumber;

  // Iterate through stored polyline references
  for (let i = 0; i < polylineReferences.length; i++) {
    var polyline = polylineReferences[i];

    // Extract the bus number from the polyline's ID or name
    var polylineBusNumber = i + 1;

    // Check if the polyline matches the selected bus
    if (selectedBus === 'bus-' + polylineBusNumber) {
      polyline.setVisible(true); // Show the selected polyline
      selectedBusPolyline = polyline; // Store the selected polyline
    document.querySelector(".my-input").placeholder = "Selected Bus: " + busNumber; // 
    } else {
      polyline.setVisible(false); // Hide other polylines
    }
  }
}

*/
/*
let selectedBusPolyline = null;
function selectBus(busNumber) {
  toggle();
  var selectedBus = 'bus-' + busNumber;

  // Hide details of previously selected bus
  document.querySelector(".info").style.display = "none";

  // Iterate through stored polyline references
  for (let i = 0; i < polylineReferences.length; i++) {
    var polyline = polylineReferences[i];
    // Extract the bus number from the polyline's ID or name
    var polylineBusNumber = i + 1;

    // Check if the polyline matches the selected bus
    if (selectedBus === 'bus-' + polylineBusNumber) {
      polyline.setvisible(true); // Show the selected polyline
      map.fitBounds(polyline.getBounds()); // Zoom to fit the selected polyline
      selectedBusPolyline = polyline; // Store the selected polyline
      document.querySelector(".my-input").placeholder = "Selected Bus: " + busNumber; // Change placeholder text to selected bus
    } else {
      polyline.setvisible(false); // Hide other polylines
    }
  }

  // Show details of selected bus after a delay
  setTimeout(function() {
    document.querySelector(".info").style.display = "block";
  }, 500);
}
*/

function selectBus(busNumber) {
  let selectedBusPolyline = null;
  toggle();

  // Check if the clicked item is "Search for Buses"
  if (busNumber === 0) {
    document.querySelector(".my-input").placeholder = "Search for Buses";
    return;
  }

  var selectedBus = 'bus-' + busNumber;

  // Iterate through stored polyline references
  for (let i = 0; i < polylineReferences.length; i++) {
    var polyline = polylineReferences[i];

    // Extract the bus number from the polyline's ID or name
    var polylineBusNumber = i+1;

    // Check if the polyline matches the selected bus
    if (selectedBus === 'bus-' + polylineBusNumber) {
      polyline.setVisible(true); // Show the selected polyline
      selectedBusPolyline = polyline; // Store the selected polyline
      document.querySelector(".my-input").placeholder = "Selected Bus: " + busNumber;
    } else {
      polyline.setVisible(false); // Hide other polylines
    }
  }
}



var currentOptionIndex = 0;
var dropdownOptions = document.querySelectorAll(".dropdown-content a");

document.querySelector(".my-input").addEventListener("keydown", function(event) {
  if (event.key === "ArrowDown") {

    // Remove the highlight from the current option
    dropdownOptions[currentOptionIndex].classList.remove("highlight");

    // Move to the next option
    currentOptionIndex = (currentOptionIndex + 1) % dropdownOptions.length;

    // Add highlight to the new option
    dropdownOptions[currentOptionIndex].classList.add("highlight");
  } else if (event.key === "ArrowUp") {
    event.preventDefault(); // Prevent the default behavior of scrolling the page

    if (document.querySelector(".dropdown").classList.contains("show")) {
      // If the dropdown is open, close it
      toggle();
    }

    // Remove the highlight from all options
    for (let i = 0; i < dropdownOptions.length; i++) {
      dropdownOptions[i].classList.remove("highlight");
    }
  }
});

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15