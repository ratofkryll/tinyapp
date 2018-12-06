const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};
// console.log(urlDatabase);

function generateRandomString(urlToConvert) {
  let randomText = '';
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    randomText += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomText;
};

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const userCreds = req.body.userCreds;
  res.cookie('username', userCreds).redirect('/urls');
});

app.post('/logout', (req, res) => {
  const username = req.cookies['username'];
  res.clearCookie('username').redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

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

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.id,
    longURL: urlDatabase
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.id,
    longURL: urlDatabase[shortURL]
  }
  urlDatabase[templateVars.shortURL] = req.body.newURL;
  res.redirect(templateVars.shortURL);
});

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

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
