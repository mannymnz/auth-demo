const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
var jwt = require('jsonwebtoken');

// allow CORS everywhere
app.use(cors());

// use SQLite database
const sqlite3 = require('sqlite3').verbose();

// create a local database. We are using a SQlite, a relational database, this time!
let db = new sqlite3.Database('./database', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

// create users table if it doesn't exist
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, secret TEXT NOT NULL)', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Created users table.');
});

app.get('/', (req, res) => {
  return res.send('welcome to the authentication demo')
})

// allow sign up with name, email, and password
app.post('/signup', async (req, res) => {
    // retrieve all the information we need from the query parameters
    const name = req.query.name;
    const email = req.query.email;
    const plain_password = req.query.password;
    const secret = req.query.secret;

    // converting the plain password to something that looks random. This is called encryption
    const salt = await bcrypt.genSalt(10)
    const encrypted_password = await bcrypt.hash(plain_password, salt)

    // insert the user into the database. We are are storing the encrypted password, not the plain password
    const sql = 'INSERT INTO users (name, email, password, secret) VALUES (?, ?, ?, ?)';
    db.run(sql, [name, email, encrypted_password, secret], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ success: 'User created.' });
    });
  });


// checks if a user's password is correct, then generates a JWT for the user to use in future requests
app.post('/login', (req, res) => {
  // retrieve information from the query parameters
  const email = req.query.email;
  const plain_password = req.query.password;
  const sql = 'SELECT * FROM users WHERE email = ?';

  db.get(sql, [email], async (err, row) => {
    encrypted_password = row.password

    password_res = await bcrypt.compare(plain_password, encrypted_password)

    if (password_res) {
        // if the password was correct, generate a JWT token and send it back to the user
        var token = jwt.sign({ id: row.id }, 'super_secret_key');

        return res.status(200).json({ message: "success", token: token })
    } else {
        return res.status(401).json({ error: 'Incorrect email or password.' });
    }

  });
});

// returns information about the user. Uses the token generated during logging in to authenticate the user.
app.get('/user', (req, res) => {
  // get the token
  const token = req.headers.token;

  // verify the token. This is where we check if the user is "logged in"
  let decoded;
  try {
    decoded = jwt.verify(token, "super_secret_key")
  } catch (error) {
    res.json({ error: "invalid token, please login again"})
  }

  // retrieve the user's data using the token
  const sql = 'SELECT users.id, users.name, users.email, users.secret FROM users WHERE id = ?';
  db.get(sql, [decoded.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    return res.json(row);
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});