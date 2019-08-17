const express = require('express');
const CronJob = require('cron').CronJob;
const cookieSession = require('cookie-session');
const expresslayouts = require('express-ejs-layouts');
const { scrapStart } = require('./utils/scrapper');
const serverless = require('serverless-http');

const app = express();

require('dotenv').config();

const routerBasePath = process.env.NODE_ENV === 'dev' ? `/` : `/.netlify/functions/server`


app.enable('trust proxy');
app.use(expresslayouts);

app.set("layout extractScripts", true);
app.set("layout extractStyles", true);
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({}));

app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  name: 'learningscrapper',
  keys: ['learningscrappereffy'],
  signed: false
}));

app.use(async(req, res, next) => {
  res.locals.host = process.env.HOST;
  next();
});

app.use(routerBasePath, require('./routes'));

scrapStart();

app.listen(124, () => {
  console.log('listening port 124....');
});


