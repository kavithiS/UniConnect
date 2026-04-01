const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
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

    comments: [commentSchema],

    attachments: [
        {
            id: { type: String, required: true },
            name: { type: String, required: true },
            size: { type: Number, required: true },
            type: { type: String },
            url: { type: String, required: true },
            uploadedAt: { type: Date, default: Date.now }
        }
    ],

    subtasks: [
        {
            title: { type: String, required: true },
            status: { 
                type: String, 
                enum: ['todo', 'inprogress', 'done'], 
                default: 'todo' 
            },
            createdAt: { type: Date, default: Date.now }
        }
    ],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);