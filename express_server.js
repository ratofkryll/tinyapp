const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

function generateRandomString(urlToConvert) {
  var randomText = '';
  var possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    randomText += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomText;
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString(req.body.longURL)
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  console.log(shortURL);
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:id', (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
