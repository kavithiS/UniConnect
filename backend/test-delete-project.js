/**
 * Test script to verify project deletion functionality
 * Usage: node test-delete-project.js
 */

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Project = require('./models/Project');
const Task = require('./models/Task');

async function testDelete() {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();

    // 1. List all projects
    console.log('\n📋 Fetching all projects from database...');
    const allProjects = await Project.find({}).select('_id title description status createdAt');
    console.log(`Found ${allProjects.length} projects:\n`);

    if (allProjects.length === 0) {
      console.log('⚠️  No projects found. Creating a test project...\n');
      const testProject = new Project({
        title: 'Test Project for Deletion',
        description: 'This project is for testing the delete functionality',
        status: 'active',
        members: [
          { name: 'Test User 1', role: 'Developer' },
          { name: 'Test User 2', role: 'Designer' }
        ]
      });
      const saved = await testProject.save();
      console.log(`✅ Created test project: ${saved._id}`);
      console.log(`   Title: ${saved.title}`);
      console.log(`   Created At: ${saved.createdAt}\n`);
      allProjects.push(saved);
    } else {
      allProjects.forEach((proj, i) => {
        console.log(`${i + 1}. ID: ${proj._id}`);
        console.log(`   Title: ${proj.title}`);
        console.log(`   Description: ${proj.description || 'N/A'}`);
        console.log(`   Status: ${proj.status}`);
        console.log(`   Created: ${proj.createdAt}\n`);
      });
    }

    // 2. Test deletion on the first project
    if (allProjects.length > 0) {
      const projectToDelete = allProjects[0];
      console.log(`🗑️  Testing deletion of project: ${projectToDelete._id}`);
      console.log(`   Title: ${projectToDelete.title}\n`);

      // Check for associated tasks
      const tasks = await Task.find({ projectId: projectToDelete._id });
      console.log(`📝 Associated tasks: ${tasks.length}`);
      if (tasks.length > 0) {
        tasks.forEach((task, i) => {
          console.log(`   ${i + 1}. ${task.title}`);
        });
      }

      // Perform deletion
      console.log(`\n⏳ Deleting project and its ${tasks.length} associated tasks...\n`);
      const deletedTasks = await Task.deleteMany({ projectId: projectToDelete._id });
      const deletedProject = await Project.findByIdAndDelete(projectToDelete._id);

      if (deletedProject) {
        console.log(`✅ Deletion successful!`);
        console.log(`   Deleted project: ${deletedProject._id}`);
        console.log(`   Deleted tasks: ${deletedTasks.deletedCount}\n`);
      } else {
        console.log(`❌ Failed to delete project\n`);
      }

      // 3. Verify deletion
      console.log('📋 Verifying deletion (fetching all projects again)...');
      const remainingProjects = await Project.find({}).select('_id title');
      console.log(`Remaining projects: ${remainingProjects.length}`);
      if (remainingProjects.length > 0) {
        remainingProjects.forEach((proj) => {
          console.log(`   - ${proj.title} (${proj._id})`);
        });
      }
    }

    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during test:', error);
    process.exit(1);
  }
}

testDelete();
