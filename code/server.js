const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




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

// Connect to the database
connection.connect((err) => {
    if(err) {
        console.error('Error connecting to the database:', err);
        return;
    }
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

// Check user login
app.post('/checkLogin', (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        console.log("Input Validation Error: Both username and password are required.");
        return res.status(400).json({ error: 'Both username and password are required' });
    }

    let query = `SELECT COUNT(*) as count FROM user WHERE username = ? AND password = ?`;

    connection.query(query, [username, password], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: 'Internal Server Error while querying the database' });
        }
        
        if (!result) {
            console.log("Unexpected: Database query returned no result.");
            return res.status(500).json({ error: 'Unexpected error occurred' });
        }

        if (result[0].count > 0) {
            console.log(`Successful login for username: ${username}`);
            res.json({ success: true, username: username });
        } else {
            console.log(`Failed login attempt for username: ${username}`);
            res.status(401).json({ success: false, error: 'Invalid username or password' });
        }
    });
});

  
  // Serving login.html
  app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
  });


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


//get stores 
app.get('/getStores', (req, res) => {
    let query = `
        SELECT store.*, GROUP_CONCAT(CONCAT_WS('|', offer.product_id, offer.price)) as offerData
        FROM store 
        LEFT JOIN offer ON store.id = offer.store_id
        GROUP BY store.id`;

    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Server error');
            throw err;
        }
        
        const response = {
            elements: results.map(store => {
                const offers = store.offerData ? store.offerData.split(',').map(data => {
                    const [product_id, price] = data.split('|');
                    return { product_id, price };
                }) : [];
                return {
                    type: 'node',
                    lat: store.lat,
                    lon: store.lon,
                    tags: {
                        name: store.name,
                        shop: store.type,
                        offers: offers
                    }
                };
            })
        };
        
        res.json(response);
    });
});



app.get('/getUniqueStoreNames', (req, res) => {
    const query = "SELECT DISTINCT name FROM store";
    
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Server error');
            return;
        }
        res.json(results.map(store => store.name));
    });
});


const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
