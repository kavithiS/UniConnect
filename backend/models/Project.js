const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    groupId: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: String, default: "active" },
    members: [{
        name: String,
        role: String
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
