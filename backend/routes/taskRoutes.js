const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Task = require('../models/Task');

// ── Multer setup for task attachments ──────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    const mime = (file.mimetype || '').split(';')[0].trim().toLowerCase();
    if (allowed.includes(mime)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed: ${mime}`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});


// ✅ Get all tasks for a project
router.get('/project/:projectId', async (req, res) => {
    try {
        const tasks = await Task.find({ projectId: req.params.projectId })
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Create a new task
router.post('/', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();

        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// ✅ Get a specific task by ID
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('projectId');

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Update a task (SAFE update)
router.put('/:id', async (req, res) => {
    try {
        const { title, description, assignedTo, priority, status, dueDate } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, assignedTo, priority, status, dueDate },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// ✅ Update ONLY status (very useful for frontend)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// ✅ Delete a task
router.delete('/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Update a subtask's status by index
router.patch('/:id/subtasks/:index', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const index = parseInt(req.params.index);
        if (isNaN(index) || index < 0 || index >= task.subtasks.length) {
            return res.status(400).json({ message: 'Invalid subtask index' });
        }

        task.subtasks[index].status = req.body.status;
        const updatedTask = await task.save();

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// ✅ Upload attachments to a task
router.post('/:id/attachments', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            req.files.forEach(f => fs.unlink(f.path, () => {}));
            return res.status(404).json({ message: 'Task not found' });
        }

        const newAttachments = req.files.map(f => ({
            name:       f.originalname,
            url:        `/uploads/${f.filename}`,
            type:       f.mimetype,
            size:       f.size,
            uploadedAt: new Date()
        }));

        task.attachments.push(...newAttachments);
        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
        res.status(400).json({ message: error.message });
    }
});


// ✅ Delete an attachment from a task
router.delete('/:id/attachments/:attachmentId', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const attachment = task.attachments.id(req.params.attachmentId);
        if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

        // Delete the file from disk
        const filePath = path.join(__dirname, '..', attachment.url);
        fs.unlink(filePath, () => {}); // ignore error if file already gone

        attachment.deleteOne();
        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// ✅ Add a comment to a task
router.post('/:id/comments', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        task.comments.push({
            text: req.body.text,
            author: req.body.author
        });

        const updatedTask = await task.save();

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


module.exports = router;