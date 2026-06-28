const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../db');
const { verifyAdmin, verifyToken } = require('../middleware/auth');
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

    if (user.is_banned) {
      return res.status(403).json({ message: 'Your account has been banned' });
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

router.get('/user/:id', (req, res) => {
  const { id } = req.params;

  const query = 'SELECT id, username, bio, avatar_url, created_at FROM User WHERE id = ?';
  db.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(results[0]);
  });
});

router.get('/users', verifyAdmin, (req, res) => {
  const query = 'SELECT id, username, email, role, is_banned, created_at FROM User ORDER BY created_at DESC';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json(results);
  });
});

router.put('/users/:id/ban', verifyAdmin, (req, res) => {
  const { id } = req.params;

  const checkQuery = 'SELECT role, is_banned FROM User WHERE id = ?';
  db.query(checkQuery, [id], (error, results) => {
    if (error) {
      console.error('Error checking user:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (results[0].role === 'admin') {
      return res.status(403).json({ message: 'Cannot ban an admin account' });
    }

    const newBanStatus = results[0].is_banned ? 0 : 1;

    const updateQuery = 'UPDATE User SET is_banned = ? WHERE id = ?';
    db.query(updateQuery, [newBanStatus, id], (error) => {
      if (error) {
        console.error('Error updating ban status:', error);
        return res.status(500).json({ message: 'Server error' });
      }
      res.status(200).json({
        message: newBanStatus ? 'User banned successfully' : 'User unbanned successfully'
      });
    });
  });
});

router.delete('/users/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;

  const checkQuery = 'SELECT role FROM User WHERE id = ?';
  db.query(checkQuery, [id], (error, checkResults) => {
    if (error) {
      console.error('Error checking user:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (checkResults[0].role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete an admin account' });
    }

    function deleteUserRow() {
      db.query('DELETE FROM User WHERE id = ?', [id], (error) => {
        if (error) {
          console.error('Error deleting user:', error);
          return res.status(500).json({ message: 'Server error' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
      });
    }

    db.query('DELETE FROM Review WHERE user_id = ?', [id], (error) => {
      if (error) {
        console.error('Error deleting user reviews:', error);
        return res.status(500).json({ message: 'Server error' });
      }

      db.query('DELETE FROM `Like` WHERE user_id = ?', [id], (error) => {
        if (error) {
          console.error('Error deleting user votes:', error);
          return res.status(500).json({ message: 'Server error' });
        }

        db.query('SELECT id FROM Build WHERE user_id = ?', [id], (error, builds) => {
          if (error) {
            console.error('Error fetching user builds:', error);
            return res.status(500).json({ message: 'Server error' });
          }

          if (builds.length === 0) {
            return deleteUserRow();
          }

          const buildIds = builds.map((b) => b.id);

          db.query('DELETE FROM BuildComponent WHERE build_id IN (?)', [buildIds], (error) => {
            if (error) {
              console.error('Error deleting build components:', error);
              return res.status(500).json({ message: 'Server error' });
            }

            db.query('DELETE FROM Review WHERE build_id IN (?)', [buildIds], (error) => {
              if (error) {
                console.error('Error deleting reviews on user builds:', error);
                return res.status(500).json({ message: 'Server error' });
              }

              db.query('DELETE FROM `Like` WHERE build_id IN (?)', [buildIds], (error) => {
                if (error) {
                  console.error('Error deleting votes on user builds:', error);
                  return res.status(500).json({ message: 'Server error' });
                }

                db.query('DELETE FROM Build WHERE user_id = ?', [id], (error) => {
                  if (error) {
                    console.error('Error deleting user builds:', error);
                    return res.status(500).json({ message: 'Server error' });
                  }
                  deleteUserRow();
                });
              });
            });
          });
        });
      });
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

module.exports = router;