const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, (req, res) => {
  const { build_id } = req.body;

  if (!build_id) {
    return res.status(400).json({ message: 'build_id is required' });
  }

  const query = 'INSERT INTO `Like` (build_id, user_id) VALUES (?, ?)';
  db.query(query, [build_id, req.user.userId], (error, results) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'You already liked this build' });
      }
      console.error('Error liking build:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(201).json({ message: 'Build liked successfully', likeId: results.insertId });
  });
});

router.delete('/:buildId', verifyToken, (req, res) => {
  const { buildId } = req.params;

  const query = 'DELETE FROM `Like` WHERE build_id = ? AND user_id = ?';
  db.query(query, [buildId, req.user.userId], (error, results) => {
    if (error) {
      console.error('Error unliking build:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Like not found' });
    }
    res.status(200).json({ message: 'Build unliked successfully' });
  });
});

router.get('/build/:buildId', (req, res) => {
  const { buildId } = req.params;

  const query = `
    SELECT \`Like\`.id, \`Like\`.created_at, User.id AS user_id, User.username
    FROM \`Like\`
    JOIN User ON \`Like\`.user_id = User.id
    WHERE \`Like\`.build_id = ?
  `;
  db.query(query, [buildId], (error, results) => {
    if (error) {
      console.error('Error fetching likes:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json({ count: results.length, likes: results });
  });
});

router.get('/user/:userId', (req, res) => {
  const { userId } = req.params

  const query = `
    SELECT Build.*
    FROM \`Like\`
    JOIN Build ON \`Like\`.build_id = Build.id
    WHERE \`Like\`.user_id = ?
    ORDER BY \`Like\`.created_at DESC
  `
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching liked builds:', error)
      return res.status(500).json({ message: 'Server error' })
    }
    res.status(200).json(results)
  })
})

module.exports = router;