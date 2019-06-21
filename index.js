const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const svRouter = require('./routers/sv.router');
const expressFileUpload = require('express-fileupload');

app.use(express.static('public'));
app.use(expressFileUpload());
app.use(bodyParser.json());

// index view
app.get('/', ({ res }) => {
  res.sendFile('./views/index.html', { root: __dirname });
});

// APIs
app.use('/', svRouter);

app.listen(PORT, console.log('listen at port', PORT));
