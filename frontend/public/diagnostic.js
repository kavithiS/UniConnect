/**
 * Browser Console Diagnostic Script
 * Paste this into your browser console (F12) to diagnose delete issues
 * 
 * Usage: Copy and paste the entire code block into browser console
 */

async function diagnoseDeleteIssue() {
  console.clear();
  console.log('%c🔍 UniConnect DELETE Project Diagnostic Tool', 'color: blue; font-size: 14px; font-weight: bold;');
  console.log('═'.repeat(60));
  
  try {
    // 1. Check Backend URL
    console.log('\n📡 Backend Connection Test:');
    const backendUrl = localStorage.getItem('backendBaseUrl') || 'http://localhost:5000';
    console.log(`   Stored Backend URL: ${backendUrl}`);
    
    const testResponse = await fetch(`${backendUrl}/api/projects`, {
      method: 'GET',
      timeout: 3000
    });
    
    if (testResponse.ok) {
      console.log(`   ✅ Backend is responding (${testResponse.status})`);
    } else {
      console.warn(`   ⚠️ Backend responded with status ${testResponse.status}`);
    }
    
    // 2. Get Projects List
    console.log('\n📋 Projects List:');
    const projectsData = await testResponse.json();
    const projects = projectsData.data || projectsData.projects || [];
    
    if (projects.length > 0) {
      console.log(`   Found ${projects.length} projects:`);
      projects.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title} (ID: ${p._id})`);
      });
    } else {
      console.warn('   ⚠️ No projects found in database');
    }
    
    // 3. Test Delete Endpoint
    console.log('\n🗑️  DELETE Endpoint Test:');
    if (projects.length > 0) {
      const testProject = projects[0];
      console.log(`   Testing delete for: ${testProject.title}`);
      console.log(`   Project ID: ${testProject._id}`);
      
      const deleteUrl = `${backendUrl}/api/projects/${testProject._id}`;
      console.log(`   DELETE URL: ${deleteUrl}`);
      
      // Don't actually delete during testing - just show the request
      console.log(`   ℹ️ Would send: DELETE ${deleteUrl}`);
      console.log(`   ℹ️ Not actually deleting during diagnostic (safety check)`);
    }
    
    // 4. LocalStorage Info
    console.log('\n💾 LocalStorage Check:');
    const projectId = localStorage.getItem('projectId');
    const themeDark = localStorage.getItem('isDarkMode');
    console.log(`   projectId: ${projectId || 'not set'}`);
    console.log(`   isDarkMode: ${themeDark || 'not set'}`);
    console.log(`   backendBaseUrl: ${backendUrl}`);
    
    // 5. Session Info
    console.log('\n👤 Session Info:');
    const userId = localStorage.getItem('userId');
    const userToken = localStorage.getItem('userToken');
    console.log(`   userId: ${userId ? '✅ set' : '❌ not set'}`);
    console.log(`   userToken: ${userToken ? '✅ set' : '❌ not set'}`);
    
    // 6. Recommendations
    console.log('\n🎯 Recommendations:');
    if (!projects.find(p => !p.isMock)) {
      console.log('   ⚠️ All projects are mocks - create a real project first');
    } else {
      console.log('   ✅ Real projects exist - you can delete them');
    }
    
    if (!userToken) {
      console.log('   ⚠️ No user token found - you may need to login');
    } else {
      console.log('   ✅ User is authenticated');
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('%cDiagnostic Complete! ✅', 'color: green; font-size: 12px;');
    console.log('If you still have issues:');
    console.log('1. Check that backend is running: npm run dev in backend folder');
    console.log('2. Verify port 5000 is accessible: http://localhost:5000/api/projects');
    console.log('3. Check browser console for any CORS errors');
    console.log('4. Clear localStorage: localStorage.clear(); location.reload();');
    
  } catch (error) {
    console.error('%c❌ Diagnostic Failed:', 'color: red; font-size: 12px;', error);
    console.error('Error message:', error.message);
    console.error('This usually means:');
    console.error('- Backend is not running');
    console.error('- Network connection issue');
    console.error('- CORS problem');
  }
}

// Run diagnostic
diagnoseDeleteIssue();

// Export function for manual testing
window.diagnoseDeleteIssue = diagnoseDeleteIssue;
console.log('%cℹ️ Diagnostic script loaded. You can run diagnoseDeleteIssue() anytime.', 'color: gray;');
