
const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { sequelize } = require('./db/models');

const { environment } = require('./config/config');
const isProduction = environment === 'production';

const app = express();

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());


if (!isProduction) {
  app.use(cors({
       origin: ['http://localhost:5173', 'https://myplace2stay.onrender.com'],
       credentials: true
     }));
}
if(isProduction){
  sequelize.sync();
}
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true,
    },
  })
);


app.use(routes);


app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = ["The requested resource couldn't be found."];
  err.status = 404;
  next(err);
});


app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);
  res.json({
    title: err.title || 'Server Error',
    message: err.message,
    errors: err.errors,
  });
});


const path = require('path');

if (isProduction) {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}


module.exports = app;
