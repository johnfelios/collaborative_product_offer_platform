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
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${activity.action}</td>
            <td>${activity.product_name}</td> 
            
        `;
        
        table.appendChild(row);
    });
})
.catch(error => console.error('Fetch error:', error));

