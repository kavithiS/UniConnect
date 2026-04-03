# Fix for 404 Delete Project Error

## Problem
The frontend is trying to reach the backend on port **5001**, but the backend is actually running on port **5008**. This is because the old port is cached in localStorage.

## Solution
Run this JavaScript in your browser console to clear the cached port and let the frontend auto-detect the correct one:

```javascript
// Clear the old backend URL from localStorage
localStorage.removeItem('backendBaseUrl');
console.log('✅ Cleared backendBaseUrl from localStorage');

// Reload the page to trigger auto-detection
window.location.reload();
```

## Step-by-Step Instructions

1. **Open your browser's Developer Tools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)

2. **Go to the Console tab**
   - Click on the "Console" tab

3. **Paste and run the code above**
   - Copy the JavaScript code above
   - Paste it into the console
   - Press Enter

4. **The page will reload automatically**
   - The frontend will now auto-detect the backend running on port 5008

5. **Try deleting a project again**
   - The 404 error should be fixed!

## Backend Status
- **Backend is running on:** http://localhost:5008
- **API endpoint:** http://localhost:5008/api
- **Frontend should now auto-detect this**

## If it still doesn't work:
1. Hard refresh the page: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check the Network tab in Dev Tools when trying to delete
3. Verify the request is going to `http://localhost:5008/api/projects/...`
