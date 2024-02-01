const express = require('express');
const router = express.Router();
const {
  getAllStrategies,
  getStrategyById,
  createStrategy,
  updateStrategy,
  deleteStrategy
} = require('./crud'); // Import CRUD functions or methods

// GET all strategies
router.get('/strategies', async (req, res) => {
  try {
    const strategies = await getAllStrategies(); // Function to get all strategies from the database
    res.json(strategies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET strategy by ID
router.get('/strategies/:id', async (req, res) => {
  try {
    const strategy = await getStrategyById(req.params.id); // Function to get strategy by ID
    if (strategy) {
      res.json(strategy);
    } else {
      res.status(404).json({ message: 'Strategy not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new strategy
router.post('/strategies', async (req, res) => {
  try {
    const newStrategy = await createStrategy(req.body); // Function to create a new strategy
    res.status(201).json(newStrategy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update a strategy
router.put('/strategies/:id', async (req, res) => {
  try {
    const updatedStrategy = await updateStrategy(req.params.id, req.body); // Function to update a strategy
    res.json(updatedStrategy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a strategy
router.delete('/strategies/:id', async (req, res) => {
  try {
    await deleteStrategy(req.params.id); // Function to delete a strategy
    res.json({ message: 'Strategy deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
