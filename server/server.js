const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to NGOConnect API' });
});

// Map API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/opportunities', require('./routes/opportunityRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/participation', require('./routes/participationRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/badges', require('./routes/badgeRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ngos', require('./routes/ngoRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
