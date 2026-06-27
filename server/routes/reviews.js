const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, (req, res) => {
  const { build_id, rating, comment } = req.body;

  if (!build_id || !rating) {
    return res.status(400).json({ message: 'build_id and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const query = 'INSERT INTO Review (build_id, user_id, rating, comment) VALUES (?, ?, ?, ?)';
  db.query(query, [build_id, req.user.userId, rating, comment || null], (error, results) => {
    if (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(201).json({ message: 'Review added successfully', reviewId: results.insertId });
  });
});

router.get('/build/:buildId', (req, res) => {
  const { buildId } = req.params;

  const query = `
    SELECT Review.*, User.username
    FROM Review
    JOIN User ON Review.user_id = User.id
    WHERE Review.build_id = ?
    ORDER BY Review.created_at DESC
  `;
  db.query(query, [buildId], (error, results) => {
    if (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json(results);
  });
});

router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  const checkQuery = 'SELECT user_id FROM Review WHERE id = ?';
  db.query(checkQuery, [id], (error, checkResults) => {
    if (error) {
      console.error('Error checking review ownership:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (checkResults[0].user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    const deleteQuery = 'DELETE FROM Review WHERE id = ?';
    db.query(deleteQuery, [id], (error) => {
      if (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({ message: 'Server error' });
      }
      res.status(200).json({ message: 'Review deleted successfully' });
    });
  });
});

module.exports = router;