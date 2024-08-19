import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
import{CalendarControl} from'./calendar.js'



const searchInput = document.getElementById('search-input');
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
    routeDropdown.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent the default link behavior
      const selectedRoute = event.target.textContent.trim(); // Get the selected route name
      
      console.log(selectedRoute);
      displayAttendanceDetails(selectedRoute, formattedDate);
    });

const calendarElement = document.querySelector('.calendar');

let formattedDate = '';

const calendarControl = new CalendarControl();
// Add a click event listener to the calendar element
calendarElement.addEventListener('click', (event) => {
  // Replace this with the code to get the selected date from the clicked element or event
  // In this example, we assume the clicked element contains the date in a "data-date" attribute
  const selectedDateAttribute =  calendarControl.selectDate(event);

  console.log(selectedDateAttribute);

  if (selectedDateAttribute) {
    const selectedDate = new Date(selectedDateAttribute);

    const day = selectedDate.getDate().toString().padStart(2, '0'); // Get the day and pad it with a leading zero if necessary
    const month = selectedDate.toLocaleString('default', { month: 'short' }); // Get the month abbreviation
    const year = selectedDate.getFullYear(); // Get the year

    formattedDate =`${day} ${month} ${year}`; // Store formatted date with quotes
    console.log(formattedDate);
  }
});

// Define the attendance table body element
const attendanceTableBody = document.querySelector('#attendanceTableBody');

async function displayAttendanceDetails(selectedRoute, formattedDate) {
  try {
    // If formattedDate is empty, set it to the current date in the format "23 Oct 2023"
    if (formattedDate === '') {
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = currentDate.toLocaleString('default', { month: 'short' });
      const year = currentDate.getFullYear();
      formattedDate = `${day} ${month} ${year}`;
      console.log(formattedDate);
    }

    attendanceTableBody.innerHTML = ''; // Clear the previous table content
    console.log(formattedDate);
    const querySnapshot = await getDocs(collection(db, 'attendance_data', 'details',formattedDate));

    querySnapshot.forEach((docSnapshot) => {
      const route = docSnapshot.data();
      const busNo = route.bus_number;
      const selectRoute = route.route_name;

      console.log(route); // For debugging and checking retrieved data structure

      if (selectRoute === selectedRoute) {
        route.students.forEach((student) => {
          const studentId = student.id;
          const attendanceStatus = student.attendance ? 'Present' : 'Absent';

          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${selectRoute}</td>
            <td>${busNo}</td>
            <td>${studentId}</td>
            <td>${attendanceStatus}</td>
          `;

          attendanceTableBody.appendChild(row);
        });
      }
    });
  } catch (error) {
    console.error('Error getting attendance details:', error);
  }
}


// Get a reference to the "Download" button
const downloadButton = document.querySelector('.download');

// Function to export table data to Excel
function exportToExcel() {
  // Create an empty workbook
  const workbook = XLSX.utils.book_new();
  const wsData = [];

  // Add headings as the first row with bold formatting and padding
  const headingsRow = ['Route name','Bus No', 'Name', 'Status'];
  document.querySelectorAll('#attendanceTableBody th').forEach((heading) => {
    headingsRow.push({ v: heading.innerText, s: { bold: true, alignment: { wrapText: true }, padding: { top: 5, right: 5, bottom: 5, left: 5 } } });
  });
  wsData.push(headingsRow);

  // Iterate through the table rows and extract data with padding
  const tableRows = document.querySelectorAll('#attendanceTableBody tr');
  tableRows.forEach((row) => {
    const rowData = [];
    row.querySelectorAll('td').forEach((cell) => {
      rowData.push({ v: cell.innerText, s: { alignment: { wrapText: true }, padding: { top: 5, right: 5, bottom: 5, left: 5 } } });
    });
    wsData.push(rowData);
  });

  // Create a worksheet with the extracted data
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Data');

  // Get today's date in the format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Save the workbook as an Excel file with today's date in the filename
  XLSX.writeFile(workbook,`attendance_${formattedDate}.xlsx`);
}

// Add a click event listener to the "Download" button
downloadButton.addEventListener('click', () => {
  exportToExcel();
});

// Call displayAttendanceDetails with 'Show All' as the default when the page loads
displayAttendanceDetails('param', formattedDate);

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15