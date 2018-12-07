const express = require('express');
const bodyParser = require('body-parser');
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use("/styles",express.static(__dirname + "/styles"));

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
};

const urlDatabase = {
  'b2xVn2': {
    shortURL: 'b2xVn2',
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'user1id'
  },
  '9sm5xK': {
    shortURL: '9sm5xK',
    longURL: 'http://www.google.com',
    userID: 'user2id'
  }
};

function generateRandomString(urlToConvert) {
  let randomText = '';
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    randomText += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomText;
};

function checkEmails(email) {
  for (let key in users) {
    if (email === users[key].email) {
      return true;
    }
  }
  return false;
}

function getKey(email) {
  for (let key in users) {
    if (email === users[key].email) {
      return key;
    }
  }
  return false;
}

// Root dir (for now redirecting to /urls)
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Register, login & logout
app.get('/register', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
  };
  if (templateVars.user_id) {
    res.redirect('/urls');
  } else {
    res.render('register', templateVars);
  }
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.status(400).send('Please provide an email and password.')
  } else if (checkEmails(email) === true) {
    res.status(400).send('Email address is already taken.')
  } else {
    let userID = generateRandomString(email);
    users[userID] = {id: userID, email: email, password: hashedPassword};
    req.session.user_id = users[userID];
    res.redirect('/urls');
  }
});

app.get('/login_error', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
  };
  if (templateVars.user_id) {
    res.redirect('/urls');
  } else {
    res.render('login_error', templateVars);
  };
});

app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
  };
  if (templateVars.user_id) {
    res.redirect('/urls');
  } else {
    res.render('login', templateVars);
  };
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  let userID = getKey(email);


  if (checkEmails(email) === false) {
    res.redirect('/login_error');
  }

  const password = bcrypt.compareSync(req.body.password, users[userID].password);
  if (checkEmails(email) === true && password === false) {
    res.redirect('/login_error');
  }

  if (checkEmails(email) === true && password === true) {
    req.session.user_id = users[userID];
    res.redirect('/urls');
  } else {
    res.send('Username or password incorrect.');
  }
});

app.post('/logout', (req, res) => {
  const user_id = req.session.user_id;
  req.session.user_id = null;
  res.redirect('/');
});

// Display /urls
app.get('/urls', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    urls: urlDatabase
  };
    res.render('urls_index', templateVars);
});

// Add new URL to urlDatabase
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id
  };
  if (templateVars.user_id) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post('/urls', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id
  };

  if (templateVars) {
    let shortURL = generateRandomString(req.body.longURL)
    urlDatabase[shortURL] = {shortURL: shortURL, longURL: req.body.longURL, userID: templateVars.user_id.id};
    res.redirect('/urls');
  } else {
    res.redirect('/login')
  }
});

// Display shortened URL page
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    shortURL: req.params.id,
    longURL: urlDatabase
  };
  if (urlDatabase[templateVars.shortURL]) {
  res.render('urls_show', templateVars);
  } else {
    res.status(404).render('404', templateVars);
  }
});

// Edit original URL for shortened URL
app.post('/urls/:id', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    shortURL: req.params.id,
    longURL: urlDatabase
  }
  if (urlDatabase[templateVars.shortURL].userID === templateVars.user_id.id) {
    urlDatabase[templateVars.shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.send('Only the owner can edit this TinyURL.')
  }
});

// Delete URL
app.post('/urls/:id/delete', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    shortURL: req.params.id
  }
    if (urlDatabase[templateVars.shortURL].userID === templateVars.user_id.id) {
    delete urlDatabase[templateVars.shortURL];
    res.redirect('/urls');
  } else {
    res.send('Only the owner can delete this TinyURL.')
  }
});

// Redirects from shortened URL to original URL
app.get('/u/:id', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id
  };
  const shortURL = req.params.id;
  const url = (urlDatabase[shortURL] || {longURL: '/notFound'}).longURL;
  res.redirect(url);
});

// Displays 404 page if the URL does not exist
app.get('*', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
  }
  res.status(404).render('404', templateVars);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
