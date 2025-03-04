const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 10000; //

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));



app.listen(PORT, '0.0.0.0', () => {
  console.log(`RENDER DEPLOYMENT: Server listening on port ${PORT}`);
});
