const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, (req, res) => {
  const { build_id, vote_type } = req.body;

  if (!build_id || !vote_type) {
    return res.status(400).json({ message: 'build_id and vote_type are required' });
  }
  if (vote_type !== 'up' && vote_type !== 'down') {
    return res.status(400).json({ message: 'vote_type must be either "up" or "down"' });
  }

  const checkQuery = 'SELECT id, vote_type FROM `Like` WHERE build_id = ? AND user_id = ?';
  db.query(checkQuery, [build_id, req.user.userId], (error, checkResults) => {
    if (error) {
      console.error('Error checking existing vote:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    if (checkResults.length === 0) {
      const insertQuery = 'INSERT INTO `Like` (build_id, user_id, vote_type) VALUES (?, ?, ?)';
      db.query(insertQuery, [build_id, req.user.userId, vote_type], (error, results) => {
        if (error) {
          console.error('Error creating vote:', error);
          return res.status(500).json({ message: 'Server error' });
        }
        res.status(201).json({ message: 'Vote added successfully', voteId: results.insertId });
      });
      return;
    }

    const existingVote = checkResults[0];

    if (existingVote.vote_type === vote_type) {
      const deleteQuery = 'DELETE FROM `Like` WHERE id = ?';
      db.query(deleteQuery, [existingVote.id], (error) => {
        if (error) {
          console.error('Error removing vote:', error);
          return res.status(500).json({ message: 'Server error' });
        }
        res.status(200).json({ message: 'Vote removed successfully' });
      });
      return;
    }

    const updateQuery = 'UPDATE `Like` SET vote_type = ? WHERE id = ?';
    db.query(updateQuery, [vote_type, existingVote.id], (error) => {
      if (error) {
        console.error('Error updating vote:', error);
        return res.status(500).json({ message: 'Server error' });
      }
      res.status(200).json({ message: 'Vote updated successfully' });
    });
  });
});

router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT Build.*
    FROM \`Like\`
    JOIN Build ON \`Like\`.build_id = Build.id
    WHERE \`Like\`.user_id = ? AND \`Like\`.vote_type = 'up'
    ORDER BY \`Like\`.created_at DESC
  `;
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching liked builds:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json(results);
  });
});

router.get('/build/:buildId', (req, res) => {
  const { buildId } = req.params;

  const query = `
    SELECT \`Like\`.id, \`Like\`.vote_type, \`Like\`.created_at, User.id AS user_id, User.username
    FROM \`Like\`
    JOIN User ON \`Like\`.user_id = User.id
    WHERE \`Like\`.build_id = ?
  `;
  db.query(query, [buildId], (error, results) => {
    if (error) {
      console.error('Error fetching votes:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    const upvotes = results.filter((vote) => vote.vote_type === 'up').length;
    const downvotes = results.filter((vote) => vote.vote_type === 'down').length;

    res.status(200).json({ upvotes, downvotes, votes: results });
  });
});

module.exports = router;