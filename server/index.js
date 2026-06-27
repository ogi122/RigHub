const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const authRoutes = require('./routes/auth');
const app = express();
const PORT = process.env.PORT || 5000;
const { verifyToken, verifyAdmin } = require('./middleware/auth');
const componentRoutes = require('./routes/components');
const buildRoutes = require('./routes/builds');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/builds', buildRoutes);

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});