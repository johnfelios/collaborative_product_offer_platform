const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const PORT = 3000;

// CORS configuration
const corsOptions = {
  origin: 'http://127.0.0.1:5500',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Enable CORS for all routes and handle preflight requests
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());  // To parse JSON request bodies

// Your other middleware and routes...


// Database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'felios123',
  database: 'web'
});

connection.connect(error => {
  if (error) throw error;
  console.log('Database connected.');
});

// Signup endpoint
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const query = 'INSERT INTO store (username, email, password) VALUES (?, ?, ?)';

  connection.query(query, [username, email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    res.json({ success: true, message: 'User registered successfully.' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
