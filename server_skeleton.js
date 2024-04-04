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
    // TODO
  });


// checks if a user's password is correct, then generates a JWT for the user to use in future requests
app.post('/login', (req, res) => {
    // TODO
});

// returns information about the user. Uses the token generated during logging in to authenticate the user.
app.get('/user', (req, res) => {
    // TODO
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});