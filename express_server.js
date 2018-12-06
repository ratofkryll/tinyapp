const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const users = {
  user1id: {
    id: 'user1id',
    email: 'user1@email.com',
    password: 'password'
  },
  user2id: {
    id: 'user2id',
    email: 'user2@email.com',
    password: 'pass'
  }
}

console.log(users);

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

function generateRandomString(urlToConvert) {
  let randomText = '';
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    randomText += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomText;
};

// Root dir (for now redirecting to /urls)
app.get('/', (req, res) => {
  res.redirect('/urls');
});

// Register, login & logout
app.get('/register', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  let userID = generateRandomString(req.body.email);
  users[userID] = {id: userID, email: req.body.email, password: req.body.password};
  console.log(users);
  res.cookie('user_id', users[userID].id).redirect('/');
});

app.post('/login', (req, res) => {
  const userCreds = req.body.userCreds;
  res.cookie('username', userCreds).redirect('/urls');
});

app.post('/logout', (req, res) => {
  const username = req.cookies['username'];
  res.clearCookie('username').redirect('/urls');
});

// Display /urls
app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

// Add new URL to urlDatabase
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString(req.body.longURL)
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Display shortened URL page
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.id,
    longURL: urlDatabase
  };
  res.render('urls_show', templateVars);
});

// Edit original URL for shortened URL
app.post('/urls/:id', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.id,
    longURL: urlDatabase[shortURL]
  }
  urlDatabase[templateVars.shortURL] = req.body.newURL;
  res.redirect(templateVars.shortURL);
});

// Delete URL
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Redirects from shortened URL to original URL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
