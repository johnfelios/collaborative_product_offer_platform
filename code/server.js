const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'felios123',
    database: 'web'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve map.html when its route is accessed
app.get('/map.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'map.html'));
});

function validatePassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+).{8,}$/;
    return regex.test(password);
}

app.post('/api/add-user', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters and contain an uppercase letter, a number, and a symbol.' });
    }

    const query = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)';
    connection.query(query, [username, email, password], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error inserting data' });
        }
        res.json({ success: true, message: 'User added successfully!' });
    });
});

app.get('/getStores', (req, res) => {
    const query = "SELECT * FROM store";
    
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Server error');
            throw err;
        }
        
        const response = {
            elements: results.map(store => ({
                type: 'node',
                lat: store.lat,
                lon: store.lon,
                tags: {
                    name: store.name,
                    shop: store.type
                }
            }))
        };
        
        res.json(response);
    });
});

const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
