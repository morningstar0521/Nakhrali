# Security Implementation Guide

## Overview
This application implements enterprise-grade security measures for authentication and authorization.

## Security Features Implemented

### 1. **JWT Token-Based Authentication**
- **Token Storage**: LocalStorage (frontend)
- **Token Expiry**: 24 hours (configurable in .env)
- **Format**: Bearer token in Authorization header
- **Location**: All protected API routes require: `Authorization: Bearer <token>`

### 2. **Role-Based Access Control (RBAC)**
- **User Roles**: `user`, `admin`
- **Admin Whitelist**: Email-based whitelist in `backend/middleware/admin.js`
- **Protected Routes**: 
  - Frontend: `/admin` (admin only)
  - Backend: All `/api/admin/*` routes

### 3. **Rate Limiting**
- **General API**: 100 requests per 10 minutes per IP
- **Auth Routes** (login/register): 5 requests per 15 minutes per IP
- **Protection**: Prevents brute force attacks

### 4. **Security Headers (Helmet)**
- XSS Protection
- Content Security Policy
- DNS Prefetch Control
- Frame Guard (clickjacking protection)
- HSTS (HTTP Strict Transport Security)

### 5. **Input Sanitization**
- **Mongo Sanitize**: Prevents NoSQL injection
- **HPP**: Prevents HTTP Parameter Pollution
- **Body Limits**: 10MB max request size

### 6. **CORS Configuration**
- **Allowed Origin**: http://localhost:5173 (development)
- **Credentials**: Enabled for cookie support
- **Production**: Update CLIENT_URL in .env

### 7. **Password Security**
- **Hashing**: bcrypt with 10 salt rounds
- **Storage**: Never stored in plain text
- **Validation**: Minimum requirements enforced

## Admin Access Configuration

### Adding Admin Users
1. **Email Whitelist** (Primary Method):
   - Edit `backend/middleware/admin.js`
   - Add emails to `ADMIN_EMAILS` array:
   ```javascript
   const ADMIN_EMAILS = [
       'admin@nakhralifashion.com',
       'youremail@domain.com'
   ];
   ```

2. **Database Role**:
   - User must have `role = 'admin'` in database
   - Update via SQL or registration with admin privileges

### Testing Admin Access
```bash
# 1. Register a user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Admin","email":"admin@nakhralifashion.com","phone":"1234567890","password":"SecurePass123!"}'

# 2. Update user role to admin (in database)
UPDATE users SET role = 'admin' WHERE email = 'admin@nakhralifashion.com';

# 3. Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nakhralifashion.com","password":"SecurePass123!"}'
```

## Frontend Security

### Protected Routes
- **Component**: `src/components/ProtectedRoute.jsx`
- **Usage**: Wraps admin-only pages
- **Checks**: Token validity + admin role

### Auth State Management
- **Location**: `src/utils/auth.js`
- **Functions**:
  - `isAuthenticated()`: Check if user is logged in
  - `isAdmin()`: Check if user has admin privileges
  - `logout()`: Clear auth data and redirect

### Header User Menu
- **Logged Out**: Shows Login/Register buttons
- **Logged In (User)**: Shows Account menu with Wishlist, Logout
- **Logged In (Admin)**: Shows Account menu with Dashboard, Wishlist, Logout

## API Endpoints

### Public Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/products` - View products
- `GET /api/search` - Search products

### Protected Routes (User)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Protected Routes (Admin Only)
- `GET /api/admin/*` - All admin operations
- `POST /api/products` - Create products
- `PUT /api/products/:id` - Update products
- `DELETE /api/products/:id` - Delete products
- `POST /api/hampers` - Manage hampers
- `POST /api/occasions` - Manage occasions

## Environment Variables

### Required Variables (.env)
```env
PORT=5001
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=24h
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Production Recommendations
1. **JWT_SECRET**: Use a strong, random 256-bit key
2. **DATABASE_URL**: Use environment-specific credentials
3. **CLIENT_URL**: Set to your production domain
4. **NODE_ENV**: Set to 'production'
5. **Enable HTTPS**: Use SSL certificates in production

## Security Best Practices

### For Development
- ✅ Keep .env file out of version control
- ✅ Use different secrets for dev/staging/production
- ✅ Regularly update dependencies
- ✅ Monitor failed login attempts

### For Production
- ✅ Enable HTTPS only
- ✅ Use httpOnly cookies for tokens (recommended upgrade)
- ✅ Implement refresh tokens for longer sessions
- ✅ Add 2FA for admin accounts
- ✅ Set up logging and monitoring
- ✅ Regular security audits
- ✅ Database backups
- ✅ Rate limiting per user (not just IP)

## Monitoring & Logging

### Recommended Tools
- **Error Tracking**: Sentry
- **Logging**: Winston or Morgan
- **Monitoring**: PM2 or New Relic
- **Security**: Snyk for dependency scanning

## Future Enhancements

### Recommended Upgrades
1. **Refresh Tokens**: Implement JWT refresh token flow
2. **2FA**: Add two-factor authentication for admins
3. **Session Management**: Track active sessions
4. **IP Whitelisting**: Restrict admin access by IP
5. **Audit Logs**: Track all admin actions
6. **Email Verification**: Verify user emails on registration
7. **Password Reset**: Secure password reset flow
8. **OAuth**: Google/Facebook login integration

## Troubleshooting

### Common Issues

1. **"Not authorized" error**
   - Check token in localStorage
   - Verify token hasn't expired
   - Check Authorization header format

2. **"Access denied" for admin**
   - Verify email in ADMIN_EMAILS whitelist
   - Check database role is 'admin'
   - Clear cache and re-login

3. **CORS errors**
   - Verify CLIENT_URL matches frontend URL
   - Check credentials: true in CORS config

4. **Rate limit exceeded**
   - Wait for rate limit window to reset
   - Check if IP is being reused (VPN/proxy)

## Support
For security concerns or questions, contact: admin@nakhralifashion.com
