function isValidPassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+).{8,}$/;
    return regex.test(password);
}

document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!isValidPassword(password)) {
        document.getElementById('message').textContent = 'Ο κωδικός πρέπει να περιέχει τουλάχιστον 8 χαρακτήρες, ένα κεφαλαίο γράμμα, έναν αριθμό και ένα σύμβολο.';
        return;                                         
    }
   
   
    
 
    fetch('/api/add-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/login.html';
        } else {
            document.getElementById('message').textContent = data.message;
        }
    })
    .catch(error => {
        console.error('Error adding user:', error);
        document.getElementById('message').textContent = 'There was an error processing your request. Please try again.';
    });
});


