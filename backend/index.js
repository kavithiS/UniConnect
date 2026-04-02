const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const requestApiRoutes = require('./routes/requestApiRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const Group = require('./models/Group');
const { normalizeAllGroupCodes } = require('./utils/groupCode');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/requests', requestApiRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/recommend', recommendationRoutes);

// MongoDB Connection

console.log("Mongo URI:", process.env.MONGODB_URI); 

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('MongoDB connected successfully');
    // Skip normalization during startup to avoid issues
    // Data will be properly created via seed endpoint
})
.catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
