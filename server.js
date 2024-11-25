const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3005;
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Skanda@1',
    database: 'agriconnect'
  });
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Sign-up route for farmers
app.post('/farmers/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO farmers (name, email, password) VALUES (?, ?, ?)';
    db.execute(query, [name, email, hashedPassword], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Email already exists' });
            }
            console.error('Error during farmer sign-up:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({ message: 'Farmer registered successfully' });
    });
});

// Login route for farmers
app.post('/farmers/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM farmers WHERE email = ?';
    db.execute(query, [email], async (err, results) => {
        if (err) {
            console.error('Error during farmer login:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid Email or Password' });
        }

        const farmer = results[0];
        const isPasswordValid = await bcrypt.compare(password, farmer.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid Email or Password' });
        }

        res.status(200).json({ message: 'Farmer logged in successfully', farmerid: farmer.id });
    });
});


// Sign-up route for buyers
app.post('/buyers/signup', async (req, res) => {
    const { name, contactno,address, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO buyers (name, contactno, address,password) VALUES (?, ?, ?,?)';
    db.execute(query, [name, contactno, address,hashedPassword], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Email already exists' });
            }
            console.error('Error during buyer sign-up:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({ message: 'Buyer registered successfully' });
    });
});

// Login route for buyers
app.post('/buyers/login', (req, res) => {
    const { contactno, password } = req.body;

    const query = 'SELECT * FROM buyers WHERE contactno = ?';
    db.execute(query, [contactno], async (err, results) => {
        if (err) {
            console.error('Error during buyer login:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid Contact-No or Password' });
        }

        const buyer = results[0];
        const isPasswordValid = await bcrypt.compare(password, buyer.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid Contact-No or Password' });
        }

        res.status(200).json({ message: 'Buyer logged in successfully',buyerid: buyer.id});
    });
});
// Add Crop Endpoint
app.post('/add-crop', (req, res) => {
    const {
        farmerName,
        contactInfo,
        farmerLocation,
        cropName,
        cropDescription,
        quantity,
        price,
        cropLocation,
        farmerid
    } = req.body;

    if (!farmerName || !contactInfo || !farmerLocation || !cropName || !farmerid || !cropDescription || !quantity || !price || !cropLocation) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Insert crop info with the farmer's ID
    const insertCropQuery = `
        INSERT INTO crops (CropName, Description, QuantityAvailable, Price, Address, FarmerID, FarmerName, ContactInfo, FLocation) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.execute(insertCropQuery, [cropName, cropDescription, quantity, price, cropLocation, farmerid, farmerName, contactInfo, farmerLocation], (err, cropResults) => {
        if (err) {
            console.error('Error inserting crop data:', err);
            return res.status(500).json({ message: 'Failed to add crop to database.' });
        }

        console.log('Crop added successfully');
       
        res.status(200).json({ message: 'Crop added successfully' });
    });
});


// Assuming you have a '/crops' route to fetch crops data
app.get('/crops', (req, res) => {
    // Query the database to fetch crops data
    const query = 'SELECT * FROM crops';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching crops data:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(200).json(results); // Send crops data as response
    });
});
app.post('/transactions', (req, res) => {
    const { transactionId, paymentMethod, transactionDate,Orderid} = req.body;

    const insertTransactionQuery = 'INSERT INTO Transactions (TransactionID, PaymentMethod, TransactionDate,OId) VALUES (?, ?, ?,?)';
    db.query(insertTransactionQuery, [transactionId, paymentMethod, transactionDate,Orderid], (err, result) => {
        if (err) {
            console.error('Error inserting transaction data:', err);
            return res.status(500).json({ message: 'Failed to submit payment details.' });
        }

        console.log('Transaction details submitted successfully');
        res.status(200).json({ message: 'Payment details submitted successfully' });
    });
});
app.post('/orders', (req, res) => {
    const { CropID, TotalPrice, buyerid } = req.body;

    // SQL query to insert the order into the database
    const sqlInsert = 'INSERT INTO orders (CropID, TotalPrice, vendorid) VALUES (?, ?, ?)';  // Use buyerid here
    db.query(sqlInsert, [CropID, TotalPrice, buyerid], (err, result) => {
        if (err) {
            console.error('Error inserting order into database:', err);
            res.status(500).json({ message: 'Failed to place the order.' });
            return;
        }

        console.log('Order inserted with ID:', result.insertId);
        res.status(200).json({ message: 'Order placed successfully.', OrderID: result.insertId });
    });
});

app.get('/orders1', (req, res) => {
    const buyerId = req.headers.buyerid; // Extract buyerid from request headers
console.log(buyerId.values);
    if (!buyerId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }// Extract vendorId from request parameters

    // Your SQL query to fetch orders data for a specific vendor
    const sqlQuery = `
 
SELECT o.orderid, c.cropname, c.quantityavailable, o.totalprice
FROM orders o
INNER JOIN crops c ON o.cropid = c.cropid
WHERE o.vendorid = ?

    `;
    
    // Execute the SQL query
    db.query(sqlQuery, [buyerId], (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).json({ error: 'Failed to fetch orders data' });
        return;
      }
      console.log(results);
      res.json(results); // Send fetched data as JSON response
    });
});

  
// POST route for admin login
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
  
    // Check if username and password match the expected values
    if (username === 'Skanda' && password === '1234') {
      // If login successful, send a success message
      res.status(200).json({ message: 'Admin login successful' });
    } else {
      // If login unsuccessful, send an error message
      res.status(401).json({ message: 'Invalid username or password' });
    }
  });
  app.get('/farmers1', (req, res) => {
    db.query('SELECT * FROM farmers', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/buyers1', (req, res) => {
    db.query('SELECT * FROM buyers', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/crops1', (req, res) => {
    db.query('SELECT * FROM crops', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/orders2', (req, res) => {
    db.query('SELECT * FROM orders', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});
app.get('/transactions1', (req, res) => {
    db.query('SELECT * FROM transactions', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});
app.post('/execute-query', (req, res) => {
    const query = req.body.query;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});
app.get('/mycrops', (req, res) => {
    const farmerId = req.headers.farmerid; // Extract farmerId from request headers
    console.log('Farmer ID:', farmerId); // Log farmerId to ensure it's correct

    if (!farmerId) {
        return res.status(401).json({ message: 'Unauthorized: farmerId missing' });
    }

    // SQL query to fetch crops for the specific farmer
    const sqlQuery = `
        SELECT cropid, cropname, quantityavailable, price
        FROM crops
        WHERE farmerid = ?`; // Assuming the crops table has a 'farmerid' field

    // Execute the SQL query
    db.query(sqlQuery, [farmerId], (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Failed to fetch crops data' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No crops found for this farmer' });
        }

        console.log('Fetched Crops:', results); // Log fetched data for debugging
        res.json(results); // Send fetched data as JSON response
    });
});
 
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
