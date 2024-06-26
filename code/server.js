const express = require('express');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');



const app = express();



// Secret key
const secretKey = 'my_secret_key';



// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
            const token = jwt.sign({ username }, secretKey); // Generate token
            res.json({ success: true, username: username, token: token }); // Send token back to client
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





//add user to database
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
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token){res.status(401).json({ error: 'Unauthorized access' });} 
    const decoded = jwt.verify(token, secretKey);
   

    let query = `
        SELECT 
            store.*, 
            GROUP_CONCAT(CONCAT_WS('|', offer.product_name, offer.price, offer.date, offer.likes, offer.dislikes, offer.stock, offer.category_id, offer.id)) as offerData
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
                    const [product_name, price, date, likes, dislikes, stock, category_id, id] = data.split('|');
                    return { 
                        product_name, 
                        price,
                        date, 
                        likes, 
                        dislikes, 
                        stock,
                        category_id,
                        id
                    };
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


//get categories
app.get('/getCategories', (req, res) => {
    // Fetch data from the categories table
    let query = `SELECT id, name, parent_id FROM categories`;

    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Server error');
            throw err;
        }
        
        res.json({ categories: results });
    });
});



//gets unique store names
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

//updates likes and dislikes
app.post('/updateRating', (req, res) => {
    const { offerId, action, username } = req.body;

    console.log(req.body);

    if (action !== 'like' && action !== 'dislike') {
        return res.status(400).json({ error: 'Invalid action' });
    }

    const columnToUpdate = action === 'like' ? 'likes' : 'dislikes';

    connection.query(`UPDATE offer SET ${columnToUpdate} = ${columnToUpdate} + 1 WHERE id = ?`, [offerId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database update error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        // Log user action
        const userAction = action === 'like' ? 'LIKE' : 'DISLIKE';
        connection.query('INSERT INTO user_activity (user_username, action, details) VALUES (?, ?, ?)', [username, userAction, JSON.stringify({offerId: offerId})], (err, results) => {
            if (err) {
                console.error(err);
                // Handle error
                return res.status(500).json({ error: 'Failed to log user activity' });
            }

            connection.query(`SELECT ${columnToUpdate} FROM offer WHERE id = ?`, [offerId], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database select error' });
                }

                if (!results.length) {
                    return res.status(404).json({ error: 'Offer not found after update' });
                }

                const newCount = results[0][columnToUpdate];
                res.json({ newCount });
            });
        });
    });
});

//updates stock
app.post('/toggleStock', (req, res) => {
    const { offerId } = req.body;

    // Get the current stock value
    connection.query('SELECT stock FROM offer WHERE id = ?', [offerId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database select error' });
        }

        if (!results.length) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        // Toggle the stock value
        const newStockValue = results[0].stock === "Σε απόθεμα" ? "Μη διαθέσιμο" : "Σε απόθεμα";

        connection.query('UPDATE offer SET stock = ? WHERE id = ?', [newStockValue, offerId], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database update error' });
            }

            res.json({ newStockValue });
        });
    });
});


app.get('/getUserActivity', (req, res) => {
    console.log("Received query:", req.query);  // log the entire query object

    const { username } = req.query; 
    if (!username) {
        return res.status(400).send('Username not provided');
    }

    //  join the offer table and get the product_name associated with the offerId
    const query = `
        SELECT ua.action, ua.timestamp, ua.details, o.product_name
        FROM user_activity AS ua
        LEFT JOIN offer AS o ON JSON_EXTRACT(ua.details, '$.offerId') = o.id
        WHERE ua.user_username = ?
        ORDER BY ua.timestamp DESC;`;

    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        console.log(`Database results for ${username}:`, results);
    
        res.json({ userActions: results });
    });
});



//get offers for subcategory

app.get('/getOffersForSubCategory/:subCategoryId', (req, res) => {
    const subCategoryId = req.params.subCategoryId;
    console.log('Fetching offers for subCategory:', subCategoryId);

    const query = 'SELECT * FROM offer WHERE category_id = ?';
    connection.query(query, [subCategoryId], (err, results) => {
        if(err) {
            console.error('Database query error:', err);
            res.status(500).send('Server Error');
        } else {
            console.log('Offers fetched:', results);
            res.json({ offers: results });
        }
    });
});


app.post('/updateOfferPrice/:offerId', (req, res) => {
    const action  = req.body.action;
    const offerId = req.params.offerId;
    const newPrice = req.body.price;
    const username = req.body.username;
    const storeId = req.body.storeId;

    if(newPrice && username) {
        // First, update the price in the offer table
        let query = 'UPDATE offer SET price = ?, username = ? WHERE id = ?';
        connection.query(query, [newPrice, username, offerId], (err, results) => {
            if(err) {
                console.error('Database query error:', err);
                res.json({ success: false });
            } else {
                
                const userAction = `Προσθήκη Προσφοράς με νέα τιμή: ${newPrice}€`;
                let numericOfferId = parseInt(offerId, 10);
                connection.query('INSERT INTO user_activity (user_username, action, details) VALUES (?, ?, ?)', [username, userAction, JSON.stringify({offerId: numericOfferId})], (err, results) => { 
                


                
                    if(err) {
                        console.error('Database query error:', err);
                        res.json({ success: false });
                    } else {
                        res.json({ success: true });
                    }
                });
            }
        });
    } else {
        res.json({ success: false });
    }
});

app.get('/searchOffers', (req, res) => {
    const searchTerm = req.query.q;

    const query = 'SELECT product_name, price, id FROM offer WHERE product_name LIKE ? LIMIT 10';
    connection.query(query, [`%${searchTerm}%`], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).send('Server Error');
        } else {
            res.json({ offers: results });
        }
    });
});

app.post('/changeUsername', (req, res) => {
    const { username, newUsername } = req.body;

    if (username && newUsername) {
        const query = 'UPDATE user SET username = ? WHERE username = ?';
        connection.query(query, [newUsername, username], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                res.status(500).send('Server Error');
            } else {
                res.json({ success: true });
            }
        });
    } else {
        res.json({ success: false });
    }
});





app.post('/changePassword', (req, res) => {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
        return res.json({ success: false, message: "All fields are required" });
    }
        // Update the password in the database
        const updateQuery = 'UPDATE user SET password = ? WHERE username = ?';
        connection.query(updateQuery, [newPassword, username], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).send('Server Error');
            }
            res.json({ success: true });
        });
    });

    app.get('/getScore', (req, res) => {
        console.log("Received query:", req.query);  // log the entire query object
    
        const { username } = req.query; 
        if (!username) {
            return res.status(400).send('Username not provided');
        }
    
        //  join the offer table and get the product_name associated with the offerId
        const query = `
            SELECT total_points, month_points
            FROM user
            WHERE username = ?;`;
    
        connection.query(query, [username], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server error');
            }
    
            console.log(`Database results for ${username}:`, results);
        
            res.json({ userScore: results });
        });
    });

    


    //get Leaderboard
app.get('/getLeaderboard', (req, res) => {
    let query = `SELECT username, total_points, month_points FROM user ORDER BY total_points DESC;`;

    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Server error');
            throw err;
        }
        
        res.json({ leaderboard: results });
    });
});

//get Price History
app.get('/getPriceHistory', (req, res) => {
    let query = `
        SELECT product_name, COUNT(price) as count_price
        FROM PriceHistory 
        GROUP BY product_name;
    `;

    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Server error');
            throw err;
        }
        
        res.json({ priceHistory: results });
    });
});


//delete offer
app.get("/deleteOffer", (req, res) => {
    const offerId = req.query.id;
    console.log(offerId);
     
    connection.query('DELETE FROM offer WHERE id = ?', [offerId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        res.sendStatus(500); // Internal Server Error
      } else if (results.affectedRows === 0) {
        res.sendStatus(404); // Offer not found
      } else {
        res.sendStatus(200); // Success
      }
    });
  });



const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

