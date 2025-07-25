const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const app = express();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); 
    }
});

const upload = multer({ storage: storage });

const connection = mysql.createConnection({
    host: '7-aytn.h.filess.io',
    user: 'CA2_duckmoment',
    password: '859ba7ea708188fb6fa493d69a28b1f41785baa3',
    database: 'CA2_duckmoment'
  });

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');
//  enable static files
app.use(express.static('public'));
// enable form processing
app.use(express.urlencoded({
    extended: false
}));

//TO DO: Insert code for Session Middleware below 
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    // Session expires after 1 week of inactivity
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } 
}));

app.use(flash());

app.get('/addPet', checkAuthenticated, checkAdmin, (req, res) => {
    res.render('addPet', {user: req.session.user } ); 
});

app.post('/addPet', upload.single('image'),  (req, res) => {
    // Extract pet data from the request body
    const { name, dob, type, activity, notes, price} = req.body;
    let image;
    if (req.file) {
        image = req.file.filename; // Save only the filename
    } else {
        image = null;
    }

    const sql = 'INSERT INTO pets (name, dob, type, activity, notes, price, image) VALUES (?, ?, ?, ?, ?, ?, ?)';
    // Insert the new pet into the database
    connection.query(sql , [name, dob, type, activity, notes, price, image], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error adding pet:", error);
            res.status(500).send('Error adding pet');
        } else {
            // Send a success response
            res.redirect('/petCare');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
