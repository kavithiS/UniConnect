const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Group = require('../models/Group');


// 🔥 SEED PROJECT + USERS + GROUPS (DISABLED - NO AUTO-SEEDING)
const seedProject = async (req, res) => {
    try {
        // Auto-seeding is disabled. Users must manually create projects and groups.
        // Return existing data if available.
        const projects = await Project.find().limit(10);
        const groups = await Group.find().limit(10);
        const users = await User.find().limit(10);
        
        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No projects found. Please create a project to get started.'
            });
        }
        
        res.json({
            success: true,
            message: 'Returned existing data (auto-seeding disabled)',
            seedData: {
                userIds: users.map(u => u._id),
                groupIds: groups.map(g => ({
                    _id: g._id,
                    groupCode: g.groupCode,
                    name: g.title
                })),
                projectIds: projects.map(p => p._id)
            }
        });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({
            success: false,
            message: 'Error retrieving data'
        });
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

// ✅ Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find({}).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: projects.length,
            data: projects,
            projects
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ Get project dashboard details (MUST BE BEFORE /:projectId route)
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

// ✅ Get single project by ID
router.get('/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Error fetching project:', error);
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


// ✅ Create a new project
router.post('/', async (req, res) => {
    try {
        const { title, description, members, groupId } = req.body;
        if (!title || !members || members.length < 1) {
            return res.status(400).json({ message: 'Title and members are required' });
        }

        const normalizedGroupId = (groupId || description || '').toString().trim();

        const project = new Project({
            title,
            description,
            groupId: normalizedGroupId,
            members,
            status: 'active'
        });

        const savedProject = await project.save();
        res.status(201).json(savedProject);
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ Delete a project and its associated tasks
router.delete('/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        console.log(`🗑️ Delete request for project: ${projectId}`);

        // Validate projectId format
        if (!projectId || projectId.length < 5) {
            console.warn(`⚠️ Invalid project ID format: ${projectId}`);
            return res.status(400).json({ 
                success: false,
                message: 'Invalid project ID format' 
            });
        }

        // Check if project exists
        const project = await Project.findById(projectId);
        console.log(`📊 Project lookup result:`, project ? `Found` : `Not found`);
        
        if (!project) {
            console.warn(`❌ Project not found: ${projectId}`);
            // List available projects for debugging
            const allProjects = await Project.find({}).select('_id title');
            console.log(`📋 Available projects:`, allProjects.map(p => `${p._id} (${p.title})`));
            
            return res.status(404).json({ 
                success: false,
                message: `Project with ID ${projectId} not found in database`,
                availableProjects: allProjects.map(p => ({ _id: p._id, title: p.title }))
            });
        }

        // Delete all tasks associated with this project
        const deleteTasksResult = await Task.deleteMany({ projectId });
        console.log(`✅ Deleted ${deleteTasksResult.deletedCount} tasks for project ${projectId}`);

        // Delete the project
        const deleteProjectResult = await Project.findByIdAndDelete(projectId);
        console.log(`✅ Project deleted: ${projectId}`);

        res.json({ 
            success: true,
            message: 'Project deleted successfully',
            deletedProject: deleteProjectResult,
            deletedTasksCount: deleteTasksResult.deletedCount
        });
    } catch (error) {
        console.error("❌ Error deleting project:", error);
        res.status(500).json({ 
            success: false,
            message: `Server error: ${error.message}`,
            error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
    }
});

module.exports = router;