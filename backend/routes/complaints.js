const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Get all complaints (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.userData.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { status, search } = req.query;
    let query = status ? { status } : {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    const complaints = await Complaint.find(query).populate('userId', 'name email');
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user-specific complaints
router.get('/user/:id', auth, async (req, res) => {
  try {
    if (req.userData.userId !== req.params.id && req.userData.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const complaints = await Complaint.find({ userId: req.params.id });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit complaint
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const complaint = new Complaint({
      title,
      description,
      category,
      priority: priority || 'Medium',
      userId: req.userData.userId
    });
    await complaint.save();
    
    // Broadcast new complaint (optional, for admin)
    const io = req.app.get('io');
    if (io) io.emit('new_complaint', complaint);

    res.status(201).json(complaint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update status (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.userData.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { status, priority } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    // Broadcast status change
    const io = req.app.get('io');
    if (io) {
      io.to(complaint.userId.toString()).emit('status_updated', complaint);
      io.emit('complaint_updated', complaint); // Total update for admin
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Comment System ---

// Post a comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const comment = new Comment({
      text: req.body.text,
      author: req.userData.userId,
      complaintId: req.params.id
    });
    await comment.save();
    
    const populatedComment = await comment.populate('author', 'name');
    
    // Broadcast new comment
    const io = req.app.get('io');
    if (io) io.emit('new_comment', { complaintId: req.params.id, comment: populatedComment });

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get comments for a complaint
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ complaintId: req.params.id }).populate('author', 'name');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
