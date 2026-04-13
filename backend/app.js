const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
};

module.exports = { app, connectDB };