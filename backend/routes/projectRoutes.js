const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Group = require('../models/Group');


// 🔥 SEED PROJECT + USERS + GROUPS (GET + POST both supported) - MUST BE BEFORE :projectId routes
const seedProject = async (req, res) => {
    try {
        // Check if already seeded
        let project = await Project.findOne({ title: "Web App Final Assessment" });
        let seedData = {};

        if (!project) {
            // ===== CREATE USERS =====
            const users = await User.insertMany([
                {
                    name: "Alice Johnson",
                    email: "alice@example.com",
                    role: "Leader",
                    skills: ["React", "Node.js", "PostgreSQL", "Project Management", "UI/UX"]
                },
                {
                    name: "Bob Smith",
                    email: "bob@example.com",
                    role: "Developer",
                    skills: ["React", "Vue.js", "JavaScript", "Python", "REST APIs"]
                },
                {
                    name: "Charlie Davis",
                    email: "charlie@example.com",
                    role: "Designer",
                    skills: ["Figma", "UI/UX", "Graphic Design", "Prototyping"]
                },
                {
                    name: "Diana Wilson",
                    email: "diana@example.com",
                    role: "Developer",
                    skills: ["Java", "Spring Boot", "Databases", "Microservices"]
                },
                {
                    name: "Eve Martinez",
                    email: "eve@example.com",
                    role: "Student",
                    skills: ["React", "HTML/CSS", "JavaScript"]
                }
            ]);

            seedData.userIds = users.map(u => u._id);
            console.log(`✅ Created ${users.length} sample users`);

            // ===== CREATE GROUPS =====
            // Generate groupCodes first (insertMany doesn't trigger pre-save hooks)
            const groupCodesData = [
                {
                    title: "Web App Development Team",
                    description: "Building a modern web application with React and Node.js. We need developers experienced in full-stack development.",
                    requiredSkills: ["React", "Node.js", "REST APIs"],
                    members: [users[0]._id, users[1]._id],
                    memberLimit: 5,
                    status: "active"
                },
                {
                    title: "Mobile App Project",
                    description: "Creating a cross-platform mobile application. Looking for developers with React Native and mobile development experience.",
                    requiredSkills: ["React Native", "JavaScript", "Mobile Dev"],
                    members: [users[2]._id, users[3]._id],
                    memberLimit: 4,
                    status: "active"
                },
                {
                    title: "UI/UX Design Squad",
                    description: "Designing intuitive user interfaces and experiences for our digital products. Need designers with Figma expertise.",
                    requiredSkills: ["Figma", "UI/UX", "Prototyping"],
                    members: [users[2]._id],
                    memberLimit: 3,
                    status: "active"
                },
                {
                    title: "Backend Optimization Group",
                    description: "Optimizing backend performance and database queries. Looking for experienced backend engineers.",
                    requiredSkills: ["Java", "Databases", "Spring Boot"],
                    members: [users[3]._id],
                    memberLimit: 4,
                    status: "active"
                }
            ];

            // Generate unique codes for each group
            const { generateUniqueGroupCode } = require('../utils/groupCode');
            for (const groupData of groupCodesData) {
                groupData.groupCode = await generateUniqueGroupCode(Group);
            }

            const groups = await Group.insertMany(groupCodesData);

            seedData.groupIds = groups.map(g => ({
                _id: g._id,
                groupCode: g.groupCode,
                title: g.title
            }));
            console.log(`✅ Created ${groups.length} sample groups`);

            // ===== CREATE PROJECT =====
            project = new Project({
                title: "Web App Final Assessment",
                groupId: groups[0]._id.toString(),
                members: [
                    { name: "Alice", role: "Leader" },
                    { name: "Bob", role: "Developer" },
                    { name: "Charlie", role: "Designer" }
                ]
            });

            const savedProject = await project.save();

            // ===== CREATE TASKS =====
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

            console.log(`✅ Created project and ${3} sample tasks`);

            return res.json({
                ...savedProject.toObject(),
                seedData
            });
        }

        // If project already exists, still return seedData by fetching users and groups
        const existingUsers = await User.find({});
        const existingGroups = await Group.find({});
        
        const existingSeedData = {
            userIds: existingUsers.map(u => u._id),
            groupIds: existingGroups.map(g => ({
                _id: g._id,
                groupCode: g.groupCode,
                title: g.title
            }))
        };

        res.json({
            ...project.toObject(),
            seedData: existingSeedData
        });

    } catch (error) {
        console.error("Seed error:", error.message);
        console.error("Full error:", error);
        res.status(500).json({ message: error.message, error: process.env.NODE_ENV === 'development' ? error.stack : undefined });
    }
};

// Support BOTH GET and POST for /seed routes
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


module.exports = router;