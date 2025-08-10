// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const schoolsRouter = require('./routes/schools');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.get('/', (req, res) => res.json({ ok: true, service: 'school-api' }));
app.use('/', schoolsRouter);
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Server error' });
});
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
