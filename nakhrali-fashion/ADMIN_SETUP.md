# Admin Setup Guide

## How to Access the Admin Dashboard

The admin dashboard requires proper authentication. Follow these steps:

### Step 1: Register an Account
1. Go to `http://localhost:5173/register`
2. Create an account with your email and password

### Step 2: Update Your Role in the Database

You need to manually update your user role to 'admin' in the database:

```sql
-- Connect to your Supabase database and run:
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Or use the Supabase SQL editor:
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the above query with your email

### Step 3: Add Your Email to Admin Whitelist

Edit `/backend/middleware/admin.js` and add your email to the whitelist:

```javascript
const ADMIN_EMAILS = [
    'admin@nakhralifashion.com',
    'shubhghiya@gmail.com',
    'your-email@example.com'  // Add your email here
];
```

### Step 4: Login
1. Go to `http://localhost:5173/login`
2. Login with your credentials
3. You should now see a "Dashboard" link in the header
4. Click it to access the admin dashboard

## Troubleshooting

### 403 Forbidden Errors

If you see "Access denied. Admin privileges required":
- ✅ Check that you're logged in (look for Dashboard link in header)
- ✅ Verify your role is 'admin' in the database
- ✅ Confirm your email is in the ADMIN_EMAILS whitelist
- ✅ Restart the backend server after updating admin.js

### Token Expired

If you see "Token invalid or expired":
- Logout and login again
- Tokens expire after 24 hours

### Can't See Dashboard Link

If the Dashboard link doesn't appear in the header:
- Check browser console for errors
- Verify localStorage has a 'token' and 'user' entry
- Confirm the user object has `role: 'admin'`

## Current Admin Emails

These emails are currently whitelisted as admins:
- admin@nakhralifashion.com
- shubhghiya@gmail.com

Add your email to this list to get admin access.
