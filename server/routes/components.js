const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', (req, res) => {
  const query = 'SELECT * FROM Component';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching components:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json(results);
  });
});

router.post('/', verifyAdmin, upload.single('image'), (req, res) => {
  const { name, category, brand, price, specs } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !category || !brand || !price) {
    return res.status(400).json({ message: 'Name, category, brand, and price are required' });
  }

  const query = 'INSERT INTO Component (name, category, brand, price, image_url, specs, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const specsJson = specs ? JSON.stringify(specs) : null;

  db.query(query, [name, category, brand, price, imageUrl, specsJson, req.user.userId], (error, results) => {
    if (error) {
      console.error('Error creating component:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(201).json({ message: 'Component created successfully', componentId: results.insertId });
  });
});

router.post('/', verifyAdmin, (req, res) => {
  const { name, category, brand, price, image_url, specs } = req.body;

  if (!name || !category || !brand || !price) {
    return res.status(400).json({ message: 'Name, category, brand, and price are required' });
  }

  const query = 'INSERT INTO Component (name, category, brand, price, image_url, specs, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const specsJson = specs ? JSON.stringify(specs) : null;

  db.query(query, [name, category, brand, price, image_url || null, specsJson, req.user.userId], (error, results) => {
    if (error) {
      console.error('Error creating component:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(201).json({ message: 'Component created successfully', componentId: results.insertId });
  });
});

router.put('/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { name, category, brand, price, image_url, specs } = req.body;

  const query = 'UPDATE Component SET name = ?, category = ?, brand = ?, price = ?, image_url = ?, specs = ? WHERE id = ?';
  const specsJson = specs ? JSON.stringify(specs) : null;

  db.query(query, [name, category, brand, price, image_url || null, specsJson, id], (error, results) => {
    if (error) {
      console.error('Error updating component:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Component not found' });
    }
    res.status(200).json({ message: 'Component updated successfully' });
  });
});

router.delete('/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Component WHERE id = ?';

  db.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error deleting component:', error);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Component not found' });
    }
    res.status(200).json({ message: 'Component deleted successfully' });
  });
});

module.exports = router;