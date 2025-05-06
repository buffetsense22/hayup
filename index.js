const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static('images')); // Serve static files if needed

// Routes
app.get('/api/status', (req, res) => {
  res.json({ message: 'BuffetSense API is running.' });
});

app.post('/api/feedback', (req, res) => {
  const { name, feedback } = req.body;
  console.log(`Feedback received from ${name}: ${feedback}`);
  res.json({ message: 'Thank you for your feedback!' });
});

app.get('/api/battery', (req, res) => {
  // Simulate a battery level (you can randomize it if needed)
  res.json({ batteryLevel: 87 });
});

// Start server
app.listen(PORT, () => {
  console.log(`BuffetSense API running at http://localhost:${PORT}`);
});
