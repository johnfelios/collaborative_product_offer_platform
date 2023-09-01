const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB Atlas
const mongoUrl = 'mongodb+srv://yiannisfelios:felios123@cluster0.qnzudjm.mongodb.net/new?retryWrites=true&w=majority'; 
// Replace <YOUR_PASSWORD_HERE> with your password but keep the rest of the string as is.
// Also, ensure you are connecting to the correct database by replacing 'storeDatabase' if needed.

let db;
MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.error(err);
    console.log('Connected to Database');
    db = client.db(); // Since you already specified the DB name in the connection string
});

// POST endpoint to add data
app.post('/addStores', (req, res) => {
    const storeCollection = db.collection('stores');
    storeCollection.insertMany(req.body, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(result.ops);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
