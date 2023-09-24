const username = localStorage.getItem('username');
document.getElementById('usernameDisplay').textContent = username;

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
