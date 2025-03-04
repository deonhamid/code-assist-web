const express = require('express');
const app = express();
const PORT = parseInt(process.env.PORT || '10000', 10);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RENDER DEPLOYMENT: Server listening on port ${PORT}`);
});
