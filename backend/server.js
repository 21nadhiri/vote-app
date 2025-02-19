const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Initialize express app
const app = express();
dotenv.config();

// Improved CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite's default development ports
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// MongoDB Schema
const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required']
  },
  options: [{
    text: {
      type: String,
      required: [true, 'Option text is required']
    },
    votes: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  created: {
    type: Date,
    default: Date.now
  }
});

const Poll = mongoose.model('Poll', pollSchema);

// Routes with improved error handling
app.get('/api/polls', async (req, res) => {
  try {
    const polls = await Poll.find().sort({ created: -1 });
    res.json(polls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ 
      message: 'Failed to fetch polls',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/polls', async (req, res) => {
  try {
    if (!req.body.question || !req.body.options || !req.body.options.length) {
      return res.status(400).json({ message: 'Question and options are required' });
    }

    const poll = new Poll({
      question: req.body.question,
      options: req.body.options.map(option => ({
        text: option,
        votes: 0
      }))
    });

    const newPoll = await poll.save();
    res.status(201).json(newPoll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(400).json({ 
      message: 'Failed to create poll',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.patch('/api/polls/:id/vote', async (req, res) => {
  try {
    if (typeof req.body.optionIndex !== 'number') {
      return res.status(400).json({ message: 'Option index is required' });
    }

    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (req.body.optionIndex >= poll.options.length || req.body.optionIndex < 0) {
      return res.status(400).json({ message: 'Invalid option index' });
    }

    poll.options[req.body.optionIndex].votes += 1;
    const updatedPoll = await poll.save();
    res.json(updatedPoll);
  } catch (error) {
    console.error('Error voting on poll:', error);
    res.status(400).json({ 
      message: 'Failed to register vote',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB connection with improved error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});
