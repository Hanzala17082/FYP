# Dummy Users Data

This directory contains dummy user data for testing the authentication flow before database integration.

## User Credentials

### Admin Users

| Email | Password | Name |
|-------|----------|------|
| `admin@tripster.com` | `admin123` | Admin User |
| `superadmin@tripster.com` | `superadmin123` | Super Admin |

**Login URL:** `/admin/login`

### Agency Users

| Email | Password | Name |
|-------|----------|------|
| `agency@globaltravels.com` | `agency123` | Global Travels Inc |
| `contact@asiatours.com` | `agency123` | Asia Tours |
| `info@luxuryescapes.com` | `agency123` | Luxury Escapes |
| `hello@budgettravel.com` | `agency123` | Budget Travel Co |

**Login URL:** `/login` (Select "Agency" role)

### Traveler Users

| Email | Password | Name |
|-------|----------|------|
| `john.doe@example.com` | `traveler123` | John Doe |
| `jane.smith@example.com` | `traveler123` | Jane Smith |
| `mike.johnson@example.com` | `traveler123` | Mike Johnson |
| `sarah.williams@example.com` | `traveler123` | Sarah Williams |
| `david.brown@example.com` | `traveler123` | David Brown |

**Login URL:** `/login` (Select "Traveler" role)

## Testing Flow

1. **Test Admin Login:**
   - Go to `/admin/login`
   - Use: `admin@tripster.com` / `admin123`
   - Should redirect to `/admin/dashboard`

2. **Test Agency Login:**
   - Go to `/login`
   - Select "Agency" role
   - Use: `agency@globaltravels.com` / `agency123`
   - Should redirect to `/agency/dashboard`

3. **Test Traveler Login:**
   - Go to `/login`
   - Select "Traveler" role
   - Use: `john.doe@example.com` / `traveler123`
   - Should redirect to `/traveler/dashboard`

4. **Test Wrong Credentials:**
   - Try wrong password → Should show error
   - Try wrong role → Should show error

5. **Test Role Protection:**
   - Login as Traveler → Try accessing `/admin/dashboard` → Should redirect
   - Login as Agency → Try accessing `/admin/dashboard` → Should redirect
   - Login as Admin → Try accessing `/traveler/dashboard` → Should redirect

## File Structure

- `dummyUsers.ts` - Contains all dummy user data and helper functions
- `README.md` - This file with credentials documentation

## Migration to Database

When ready to integrate with database:

1. Replace `findUserByCredentials()` calls with actual API calls
2. Update authentication service to use backend endpoints
3. Remove dummy users file or keep for development/testing
4. Update login pages to use `authService.login()` instead of direct dummy user lookup

## Notes

- All passwords are simple for testing (e.g., `admin123`, `agency123`, `traveler123`)
- In production, passwords should be hashed and stored securely
- User IDs are prefixed with role (e.g., `admin-1`, `agency-1`, `traveler-1`)
- Avatars are generated using UI Avatars API
