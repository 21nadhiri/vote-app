// Required dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Initialize express app
const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Schema
const pollSchema = new mongoose.Schema({
  question: String,
  options: [{
    text: String,
    votes: {
      type: Number,
      default: 0
    }
  }],
  created: {
    type: Date,
    default: Date.now
  }
});

const Poll = mongoose.model('Poll', pollSchema);

// Routes
// Get all polls
app.get('/api/polls', async (req, res) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new poll
app.post('/api/polls', async (req, res) => {
  const poll = new Poll({
    question: req.body.question,
    options: req.body.options.map(option => ({
      text: option,
      votes: 0
    }))
  });

  try {
    const newPoll = await poll.save();
    res.status(201).json(newPoll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Vote on a poll
app.patch('/api/polls/:id/vote', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    const optionIndex = req.body.optionIndex;
    poll.options[optionIndex].votes += 1;
    
    const updatedPoll = await poll.save();
    res.json(updatedPoll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(3001, () => {
      console.log('Server is running on port 3001');
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });