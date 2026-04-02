const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Task = require('../models/Task');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname) || '';
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB per file
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
        const { title, description, assignedTo, priority, status, dueDate, subtasks } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, assignedTo, priority, status, dueDate, subtasks },
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


// ✅ Add attachment(s) to a task
router.post('/:id/attachments', upload.array('files'), async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const newAttachments = req.files.map((file) => ({
            id: `${Date.now()}-${file.filename}`,
            name: file.originalname,
            size: file.size,
            type: file.mimetype,
            url: `/uploads/${file.filename}`,
            uploadedAt: new Date()
        }));

        task.attachments = task.attachments ? [...task.attachments, ...newAttachments] : newAttachments;
        await task.save();

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ Delete a task attachment
router.delete('/:id/attachments/:attachmentId', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const attachment = task.attachments.find((att) => att.id === req.params.attachmentId);
        if (!attachment) {
            return res.status(404).json({ message: "Attachment not found" });
        }

        task.attachments = task.attachments.filter((att) => att.id !== req.params.attachmentId);
        await task.save();

        // Also remove the file from disk if exists
        const localPath = path.join(UPLOAD_DIR, path.basename(attachment.url));
        if (fs.existsSync(localPath)) {
            fs.unlink(localPath, (err) => {
                if (err) {
                    console.warn('Could not delete uploaded file:', err);
                }
            });
        }

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ Add a subtask to a task
router.post('/:id/subtasks', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        task.subtasks.push({
            title: req.body.title,
            status: req.body.status || 'todo'
        });

        const updatedTask = await task.save();

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ Update a subtask status
router.patch('/:id/subtasks/:subtaskIndex', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const subtaskIndex = parseInt(req.params.subtaskIndex);
        if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length) {
            return res.status(404).json({ message: "Subtask not found" });
        }

        task.subtasks[subtaskIndex].status = req.body.status;

        const updatedTask = await task.save();

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ Delete a subtask
router.delete('/:id/subtasks/:subtaskIndex', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const subtaskIndex = parseInt(req.params.subtaskIndex);
        if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length) {
            return res.status(404).json({ message: "Subtask not found" });
        }

        task.subtasks.splice(subtaskIndex, 1);

        const updatedTask = await task.save();

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;