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


//
$("#confirmUsernameChange").on("click", function() {
    const newUsername = $("#newUsername").val();
    console.log("New username inputed: ", newUsername);
    
  //confirmation
    const isConfirmed = window.confirm("Είστε σίγουρος/η ότι θέλετε να αλλάξετε το όνομα χρήστη;");
    
    if (isConfirmed) {
        updateUsername(newUsername);
        localStorage.setItem('username', newUsername);
        location.reload();
    } else {
        console.log("Username change was canceled.");
    }
});

//password change 
$("#confirmChange").on("click", function() {
    const newPassword = $("#newPassword").val();
    const checknewPassword = $("#checknewPassword").val();

    if (newPassword != checknewPassword) {
        const isConfirmed = window.confirm("Οι κωδικοί δεν ταιριάζουν. Παρακαλώ προσπαθήστε ξανά.");
    }
    if (!isValidPassword(newPassword)) {
        const isConfirmed = window.confirm("Ο κωδικός πρέπει να περιέχει τουλάχιστον 8 χαρακτήρες, ένα κεφαλαίο γράμμα, έναν αριθμό και ένα σύμβολο.");
        return;                                         
    }
    else {
    console.log("New Password inputed: ", newPassword);

    // Show confirmation dialog
    const isConfirmed = window.confirm("Θέλετε σίγουρα να αλλάξετε κωδικό πρόσβασης;");

    if (isConfirmed) {
        const isConfirmed = window.confirm("Ο κωδικός σας άλλαξε επιτυχώς.");
        updatePassword(newPassword);
        location.reload();

    } else {
        console.log("Password change was canceled.");
    }
}


function isValidPassword(newPassword) {
    const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+).{8,}$/;
    return regex.test(newPassword);
}
});

 
function updateUsername(newUsername) {
    let username = localStorage.getItem('username'); // Retrieve username from localStorage
    console.log("Updating username with: ", newUsername);

    if(newUsername && username) {
        fetch(`/changeUsername`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, newUsername: newUsername })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                alert('Το όνομα χρήστη άλλαξε επιτυχώς!');
            } else {
                alert('There was an error updating the username.');
            }
        });
    } else {
        alert('Please enter a valid username.');
    }
}





function updatePassword(newPassword) {
    let username = localStorage.getItem('username'); // Retrieve username from localStorage
    
    
    
    function isValidPassword(newPassword) {
        const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+).{8,}$/;
        return regex.test(newPassword);
    }
    if (!isValidPassword(newPassword)) {
        const isConfirmed = window.confirm("Ο κωδικός πρέπει να περιέχει τουλάχιστον 8 χαρακτήρες, ένα κεφαλαίο γράμμα, έναν αριθμό και ένα σύμβολο.");
        return;                                         
    }else
        {
        fetch(`/changePassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, newPassword: newPassword })
        })
        console.log("Updating password with: ", newPassword)
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                alert('Ο κωδικός σας άλλαξε επιτυχώς!');
                
            } else {
                alert('There was an error updating the password.');
            }
        });
    } 
}


