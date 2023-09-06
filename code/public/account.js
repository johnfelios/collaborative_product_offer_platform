const username = localStorage.getItem('username');
document.getElementById('usernameDisplay').textContent = username;


fetch(`/getUserActivity?username=${username}`)
.then(response => response.json())
.then(data => {
    const userActions = data.userActions;
    const table = document.querySelector('#user-activity-table tbody');
    table.innerHTML = '';
    
    userActions.forEach(activity => {
        const row = document.createElement('tr');
        const date = new Date(activity.timestamp);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} \t&nbsp;&nbsp; ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${activity.action}</td>
            <td>${activity.product_name}</td> 
            
        `;
        
        table.appendChild(row);
    });
})
.catch(error => console.error('Fetch error:', error));


const usernameBtn = document.getElementById('changeUsernameBtn');
const passwordBtn = document.getElementById('changePasswordBtn');

const usernameModal = document.getElementById('usernameModal');
const passwordModal = document.getElementById('passwordModal');

// Open modals
usernameBtn.onclick = () => {
    usernameModal.style.display = "block";
}

passwordBtn.onclick = () => {
    passwordModal.style.display = "block";
}

// Close modals
const closeModalButtons = document.getElementsByClassName("close");
for (let i = 0; i < closeModalButtons.length; i++) {
    closeModalButtons[i].onclick = function() {
        usernameModal.style.display = "none";
        passwordModal.style.display = "none";
    }
}



