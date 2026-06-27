const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/', (req, res) => {
  const query = 'SELECT * FROM Build';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching builds:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json(results);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;

  const buildQuery = 'SELECT * FROM Build WHERE id = ?';
  db.query(buildQuery, [id], (error, buildResults) => {
    if (error) {
      console.error('Error fetching build:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    if (buildResults.length === 0) {
      return res.status(404).json({ message: 'Build not found' });
    }

    const build = buildResults[0];

    const componentsQuery = `
      SELECT Component.*, BuildComponent.quantity
      FROM BuildComponent
      JOIN Component ON BuildComponent.component_id = Component.id
      WHERE BuildComponent.build_id = ?
    `;
    db.query(componentsQuery, [id], (error, componentResults) => {
      if (error) {
        console.error('Error fetching build components:', error);
        return res.status(500).json({ message: 'Server error' });
      }

      build.components = componentResults;
      res.status(200).json(build);
    });
  });
});

router.post('/', verifyToken, (req, res) => {
  const { title, description, purpose, componentIds } = req.body;

  if (!title || !description || !componentIds || componentIds.length === 0) {
    return res.status(400).json({ message: 'Title, description, and at least one component are required' });
  }

  const priceQuery = 'SELECT id, price FROM Component WHERE id IN (?)';
  db.query(priceQuery, [componentIds], (error, priceResults) => {
    if (error) {
      console.error('Error fetching component prices:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    const totalPrice = priceResults.reduce((sum, component) => sum + Number(component.price), 0);

    const buildQuery = 'INSERT INTO Build (user_id, title, description, purpose, total_price) VALUES (?, ?, ?, ?, ?)';
    db.query(buildQuery, [req.user.userId, title, description, purpose || null, totalPrice], (error, buildResult) => {
      if (error) {
        console.error('Error creating build:', error);
        return res.status(500).json({ message: 'Server error' });
      }

      const buildId = buildResult.insertId;

      const buildComponentQuery = 'INSERT INTO BuildComponent (build_id, component_id) VALUES ?';
      const values = componentIds.map((componentId) => [buildId, componentId]);

      db.query(buildComponentQuery, [values], (error) => {
        if (error) {
          console.error('Error linking components to build:', error);
          return res.status(500).json({ message: 'Server error while linking components' });
        }

        res.status(201).json({ message: 'Build created successfully', buildId: buildId, totalPrice: totalPrice });
      });
    });
  });
});

router.put('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { title, description, purpose } = req.body;

  const checkQuery = 'SELECT user_id FROM Build WHERE id = ?';
  db.query(checkQuery, [id], (error, checkResults) => {
    if (error) {
      console.error('Error checking build ownership:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'Build not found' });
    }
    if (checkResults[0].user_id !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit your own builds' });
    }

    const updateQuery = 'UPDATE Build SET title = ?, description = ?, purpose = ? WHERE id = ?';
    db.query(updateQuery, [title, description, purpose || null, id], (error) => {
      if (error) {
        console.error('Error updating build:', error);
        return res.status(500).json({ message: 'Server error' });
      }
      res.status(200).json({ message: 'Build updated successfully' });
    });
  });
});

router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  const checkQuery = 'SELECT user_id FROM Build WHERE id = ?';
  db.query(checkQuery, [id], (error, checkResults) => {
    if (error) {
      console.error('Error checking build ownership:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'Build not found' });
    }
    if (checkResults[0].user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own builds' });
    }

    const deleteComponentsQuery = 'DELETE FROM BuildComponent WHERE build_id = ?';
    db.query(deleteComponentsQuery, [id], (error) => {
      if (error) {
        console.error('Error deleting build components:', error);
        return res.status(500).json({ message: 'Server error' });
      }

      const deleteBuildQuery = 'DELETE FROM Build WHERE id = ?';
      db.query(deleteBuildQuery, [id], (error) => {
        if (error) {
          console.error('Error deleting build:', error);
          return res.status(500).json({ message: 'Server error' });
        }
        res.status(200).json({ message: 'Build deleted successfully' });
      });
    });
  });
});

router.get('/user/:userId', (req, res) => {
  const { userId } = req.params

  const query = 'SELECT * FROM Build WHERE user_id = ? ORDER BY created_at DESC'
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching user builds:', error)
      return res.status(500).json({ message: 'Server error' })
    }
    res.status(200).json(results)
  })
})

module.exports = router;