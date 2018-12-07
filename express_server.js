const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080;

const password = "purple-monkey-dinosaur";
const hashedPassword = bcrypt.hashSync(password, 10);

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

// Root dir (for now redirecting to /urls)
app.get('/', (req, res) => {
  res.redirect('/urls');
});

// Register, login & logout
app.get('/register', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send('Please provide an email and password.')
  } else if (checkEmails(email) === true) {
    res.status(400).send('Email address is already taken.')
  } else {
    let userID = generateRandomString(email);
    users[userID] = {id: userID, email: email, password: password};
    res.cookie('user_id', users[userID].id).redirect('/');
  }
});

app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userID = '';
  function checkPasswords(password) {
    for (let key in users) {
      if (password === users[key].password) {
        userID = key;
        return true;
      }
    }
    return false;
  }
  if (checkEmails(email) === true && checkPasswords(password) === true) {
    res.cookie('user_id', users[userID]).redirect('/urls');
  } else {
    res.send('Username or password incorrect.');
  }
});

app.post('/logout', (req, res) => {
  const user_id = req.cookies['user_id'];
  res.clearCookie('user_id').redirect('/urls');
});

// Display /urls
app.get('/urls', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    urls: urlDatabase
  };
  if (templateVars.user_id) {
    res.render('urls_index', templateVars);
  } else {
    res.redirect('login');
  }
});

// Add new URL to urlDatabase
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id']
  };
  if (templateVars.user_id) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('register');
  }
});

app.post('/urls', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id']
  };
  let shortURL = generateRandomString(req.body.longURL)
  urlDatabase[shortURL] = {shortURL: shortURL, longURL: req.body.longURL, userID: templateVars[user_id].id};
  res.redirect(`/urls/${shortURL}`);
});

// Display shortened URL page
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    shortURL: req.params.id,
    longURL: urlDatabase
  };
  res.render('urls_show', templateVars);
});

// Edit original URL for shortened URL
app.post('/urls/:id', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
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
    user_id: req.cookies['user_id'],
    shortURL: req.params.id,
    longURL: urlDatabase
  }
    if (longURL[templateVars.shortURL].userID === templateVars.user_id.id) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send('Only the owner can delete this TinyURL.')
  }
});

// Redirects from shortened URL to original URL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].shortURL;
  res.redirect(longURL);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
