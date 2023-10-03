const username = localStorage.getItem('username');
document.getElementById('usernameDisplay').textContent = username;


const authToken = localStorage.getItem('token');
if (!authToken) {
    //if authentication token is missing, redirect to the login page
    window.location.href = 'login.html';
}

//Leaderboard
fetch(`/getLeaderboard`)
.then(response => response.json())
.then(data => {
    const leaderboard = data.leaderboard;
    const table = document.querySelector('#leaderboard-table tbody');
    table.innerHTML = '';
    
   leaderboard.forEach(lead => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${lead.username}</td>
            <td>${lead.total_points}</td>
            <td>${lead.month_points}</td> 
        `;
        
        table.appendChild(row);
    });
})
.catch(error => console.error('Fetch error:', error));
