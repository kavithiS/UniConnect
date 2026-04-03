// Dev-only helper to seed localStorage.userId with a valid demo user _id
// Runs only on localhost in development mode and only if userId is not already set.

import { detectBackendBaseUrl, getApiBaseUrl } from './backendUrl';

async function seedDemoUser() {
  try {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname || '';
    if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/profile-setup')) {
      return;
    }
    const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test((value || '').trim());

    const userExists = async (apiBase, id) => {
      if (!id) return false;
      try {
        const [studentsRes, usersRes] = await Promise.all([
          fetch(`${apiBase}/students`),
          fetch(`${apiBase}/users`),
        ]);

        const studentData = studentsRes.ok ? await studentsRes.json() : null;
        const userData = usersRes.ok ? await usersRes.json() : null;

        const students = studentData?.data || studentData?.students || [];
        const users = userData?.data || userData?.users || [];

        const inStudents = Array.isArray(students) && students.some((s) => (s?._id || s?.id) === id);
        const inUsers = Array.isArray(users) && users.some((u) => (u?._id || u?.id) === id);

        return inStudents || inUsers;
      } catch {
        return false;
      }
    };

    const existingUserId = localStorage.getItem('userId');
    if (existingUserId && !isObjectId(existingUserId)) {
      // Replace legacy ids like "S001" with an ObjectId-based user id
      localStorage.removeItem('userId');
      // eslint-disable-next-line no-console
      console.info('seedLocalStorage: removed invalid userId from localStorage');
    }

    // Only run on local dev hosts
    const hostname = window.location.hostname;
    if (!/localhost|127\.0\.0\.1/.test(hostname)) {
      // eslint-disable-next-line no-console
      console.info('seedLocalStorage: not localhost, skipping');
      return;
    }

    await detectBackendBaseUrl();
    const API_BASE = getApiBaseUrl();

    // If existing userId does not exist in current DB (common after in-memory reset), reseed it
    const currentId = localStorage.getItem('userId');
    if (currentId) {
      const exists = await userExists(API_BASE, currentId);
      if (!exists) {
        localStorage.removeItem('userId');
        // eslint-disable-next-line no-console
        console.info('seedLocalStorage: removed stale userId from localStorage');
      } else {
        // eslint-disable-next-line no-console
        console.info('seedLocalStorage: userId already present, skipping');
      }
    }

    // Prefer student IDs for collaboration flows (groups/requests/chat use Student records)
    try {
      if (!localStorage.getItem('userId')) {
        const res = await fetch(`${API_BASE}/students`);
        if (res.ok) {
          const data = await res.json();
          const students = data?.data || data?.students || [];
          const first = Array.isArray(students) ? students[0] : null;
          const id = first?._id || first?.id;
          if (id && isObjectId(id)) {
            localStorage.setItem('userId', id);
            // eslint-disable-next-line no-console
            console.info('seedLocalStorage: seeded userId from /students', id);
          }
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('seedLocalStorage: error fetching students', err);
    }

    // Fallback: seed from project route (contains user IDs in some environments)
    try {
      if (!localStorage.getItem('userId')) {
        const res = await fetch(`${API_BASE}/projects/seed`);
        if (res.ok) {
          const payload = await res.json();
          const seededUsers = payload?.seedData?.userIds;
          const id = Array.isArray(seededUsers) ? seededUsers[0] : null;
          if (id && isObjectId(id)) {
            localStorage.setItem('userId', id);
            // eslint-disable-next-line no-console
            console.info('seedLocalStorage: seeded userId from /projects/seed', id);
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn('seedLocalStorage: failed to seed project/users', res.status);
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('seedLocalStorage: error seeding users', err);
    }

    // Final fallback: fetch users directly
    try {
      if (!localStorage.getItem('userId')) {
        const res = await fetch(`${API_BASE}/users`);
        if (res.ok) {
          const data = await res.json();
          const users = data?.data || [];
          const first = Array.isArray(users) ? users[0] : null;
          const id = first?._id || first?.id;
          if (id && isObjectId(id)) {
            localStorage.setItem('userId', id);
            // eslint-disable-next-line no-console
            console.info('seedLocalStorage: seeded userId from /users', id);
          }
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('seedLocalStorage: error fetching users', err);
    }

    // Try to seed a projectId (use seed/fallback route)
    try {
      if (!localStorage.getItem('projectId')) {
        // Prefer seed endpoint which ensures a project exists
        let res = await fetch(`${API_BASE}/projects/seed`);
        if (!res.ok) {
          // fallback to existing project
          res = await fetch(`${API_BASE}/projects/seed/fallback`);
        }

        if (res.ok) {
          const project = await res.json();
          const pid = project._id || project.id || (project.project && project.project._id) || (project.seedData && project.seedData.groupIds && project.seedData.groupIds[0] && project.seedData.groupIds[0]._id);
          if (pid) {
            localStorage.setItem('projectId', pid);
            // eslint-disable-next-line no-console
            console.info('seedLocalStorage: seeded projectId', pid);
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn('seedLocalStorage: failed to seed/fetch project', res.status);
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('seedLocalStorage: error fetching project seed', err);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('seedLocalStorage: unexpected error', err);
  }
}

export default seedDemoUser;
