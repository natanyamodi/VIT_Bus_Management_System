const username = localStorage.getItem('username');
console.log(username)
            // Display the username in the .id element
            const idElement = document.querySelector('.id');
            if (idElement) {
              idElement.textContent = username ;
              
            } else {
              console.error("Element with class 'id' not found");
            }