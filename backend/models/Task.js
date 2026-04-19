const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const subtaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String, enum: ['todo', 'inprogress', 'done'], default: 'todo' }
});

const attachmentSchema = new mongoose.Schema({
    name:       { type: String, required: true },
    url:        { type: String, required: true },
    type:       { type: String },
    size:       { type: Number },
    uploadedAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: String },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High'], 
        default: 'Medium' 
    },

    status: { 
        type: String, 
        enum: ['todo', 'inprogress', 'done'], 
        default: 'todo' 
    },

    dueDate: { type: Date },

    projectId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },

    subtasks:    [subtaskSchema],
    attachments: [attachmentSchema],

    comments: [commentSchema],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);