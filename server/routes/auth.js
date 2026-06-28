const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO User (username, email, password_hash) VALUES (?, ?, ?)';
    db.query(query, [username, email, passwordHash], (error, results) => {
      if (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Error registering user' });
      }
      res.status(201).json({ message: 'User registered successfully', userId: results.insertId });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM User WHERE email = ?';
  db.query(query, [email], async (error, results) => {
    if (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  });
});

router.put('/avatar', verifyToken, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }

  const avatarUrl = `/uploads/${req.file.filename}`;

  const query = 'UPDATE User SET avatar_url = ? WHERE id = ?';
  db.query(query, [avatarUrl, req.user.userId], (error) => {
    if (error) {
      console.error('Error updating avatar:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json({ message: 'Avatar updated successfully', avatarUrl: avatarUrl });
  });
});

router.get('/user/:id', (req, res) => {
  const { id } = req.params

  const query = 'SELECT id, username, bio, avatar_url, created_at FROM User WHERE id = ?'
  db.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error fetching user:', error)
      return res.status(500).json({ message: 'Server error' })
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json(results[0])
  })
})

const { verifyAdmin } = require('../middleware/auth')

router.get('/users', verifyAdmin, (req, res) => {
  const query = 'SELECT id, username, email, role, created_at FROM User ORDER BY created_at DESC'
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching users:', error)
      return res.status(500).json({ message: 'Server error' })
    }
    res.status(200).json(results)
  })
})

router.put('/users/:id/role', verifyAdmin, (req, res) => {
  const { id } = req.params
  const { role } = req.body

  const query = 'UPDATE User SET role = ? WHERE id = ?'
  db.query(query, [role, id], (error) => {
    if (error) {
      console.error('Error updating user role:', error)
      return res.status(500).json({ message: 'Server error' })
    }
    res.status(200).json({ message: 'User role updated successfully' })
  })
})

module.exports = router;