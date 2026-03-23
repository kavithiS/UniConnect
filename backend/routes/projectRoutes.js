const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');


// ✅ Get project dashboard details
router.get('/:projectId/dashboard', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const tasks = await Task.find({ projectId: req.params.projectId });

        const totalTasks = tasks.length;

        // ✅ FIXED statuses
        const doneTasks = tasks.filter(t => t.status === 'done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'inprogress').length;
        const todoTasks = tasks.filter(t => t.status === 'todo').length;

        const progress = totalTasks === 0 
            ? 0 
            : Math.round((doneTasks / totalTasks) * 100);

        // ✅ Upcoming deadlines
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        const upcomingDeadlines = tasks.filter(t => {
            if (!t.dueDate || t.status === 'done') return false;
            const dueDate = new Date(t.dueDate);
            return dueDate > now && dueDate <= nextWeek;
        });

        res.json({
            project,
            stats: {
                totalTasks,
                doneTasks,
                inProgressTasks,
                todoTasks,
                progress
            },
            upcomingDeadlines
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Add member to project
router.post('/:projectId/members', async (req, res) => {
    try {
        const { name, role } = req.body;
        if (!name || !role) {
            return res.status(400).json({ message: 'Name and role are required' });
        }

        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        project.members.push({ name, role });
        await project.save();

        res.status(201).json(project.members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// 🔥 SEED PROJECT (GET + POST both supported)
const seedProject = async (req, res) => {
    try {
        let project = await Project.findOne({ title: "Web App Final Assessment" });

        if (!project) {
            project = new Project({
                title: "Web App Final Assessment",
                groupId: "G105",
                members: [
                    { name: "Alice", role: "Leader" },
                    { name: "Bob", role: "Developer" },
                    { name: "Charlie", role: "Designer" }
                ]
            });

            const savedProject = await project.save();

            // ✅ FIXED statuses here too
            await Task.insertMany([
                {
                    title: "Design UI Mockups",
                    description: "Create Figma designs",
                    assignedTo: "Charlie",
                    priority: "High",
                    status: "done",
                    dueDate: new Date(Date.now() - 86400000),
                    projectId: savedProject._id
                },
                {
                    title: "Setup Backend Server",
                    description: "Initialize express and mongodb",
                    assignedTo: "Alice",
                    priority: "High",
                    status: "inprogress",
                    dueDate: new Date(Date.now() + 86400000),
                    projectId: savedProject._id
                },
                {
                    title: "Implement Kanban Board",
                    description: "Use dnd library",
                    assignedTo: "Bob",
                    priority: "Medium",
                    status: "todo",
                    dueDate: new Date(Date.now() + 86400000 * 3),
                    projectId: savedProject._id
                }
            ]);

            return res.json(savedProject);
        }

        res.json(project);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Support BOTH GET and POST
router.get('/seed', seedProject);
router.post('/seed', seedProject);


// Fallback route
router.get('/seed/fallback', async (req, res) => {
    try {
        const project = await Project.findOne();
        if (!project) return res.status(404).json({ message: 'No projects found' });

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;