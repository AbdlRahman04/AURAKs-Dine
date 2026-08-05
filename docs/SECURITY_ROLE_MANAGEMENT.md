# Security and Role Management Documentation

## How to Change Admin to Student Role

### Current Implementation

The application has **security protections** that prevent admin demotion to protect system integrity:

1. **Frontend Protection** (UserManagementPage.tsx):
   - Prevents changing an admin's role to student in the UI
   - Blocks self-demotion attempts

2. **Backend Protection** (server/routes.ts):
   - Server-side validation prevents admins from demoting other admins
   - Prevents users from removing their own admin privileges
   - Validates role values ('admin' or 'student' only)

### To Change Admin to Student (If Needed)

**Option 1: Direct Database Update (PostgreSQL)**

If you have direct database access and need to change a role, you can use parameterized SQL:

```sql
-- SAFE: Using parameterized query
UPDATE users 
SET role = 'student', updated_at = NOW() 
WHERE id = $1;
-- Bind parameter: [user-uuid-here]
```

**Option 2: Using the Admin Script**

For the first admin setup, you can use the `scripts/make-admin.ts` script in reverse by modifying it, but **this is not recommended for production**.

**Option 3: Temporary Backend Override**

You could temporarily modify `server/routes.ts` to allow admin demotion for a specific operation, but this should be:
- Done only when absolutely necessary
- Immediately reverted after the change
- Logged for audit purposes

### Recommended Approach

1. **Keep at least one admin** - Never demote the last admin
2. **Use proper authorization** - Ensure multiple admins exist before demoting
3. **Audit trail** - All role changes are logged (check audit logs)

---

## SQL Injection Security

### ✅ Your Application is PROTECTED Against SQL Injection

The application uses **Drizzle ORM** which automatically uses **parameterized queries**. This means SQL injection attacks are **NOT POSSIBLE** with the current implementation.

### How Drizzle ORM Protects You

**Example from your code** (`server/storage.ts`):

```typescript
// This code is SAFE - Drizzle uses parameterized queries
async getAllUsers(): Promise<User[]> {
  return await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));
}

async updateUserRole(id: string, role: string): Promise<User> {
  const [user] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}
```

**What Drizzle Does:**
- Automatically converts TypeScript queries to parameterized SQL
- Escapes all user input
- Prevents SQL injection attacks

**Generated SQL (what actually runs):**
```sql
-- Drizzle generates parameterized queries like this:
UPDATE users 
SET role = $1, updated_at = $2 
WHERE id = $3;

-- Values are bound separately, preventing injection:
-- Parameters: ['student', '2024-01-01 12:00:00', 'user-uuid-here']
```

### ❌ SQL Injection Attack Example (What Would Be Vulnerable)

**If you used string concatenation (DO NOT DO THIS):**
```typescript
// VULNERABLE CODE - NEVER DO THIS
const query = `SELECT * FROM users WHERE id = '${userId}'`;
// If userId = "'; DROP TABLE users; --"
// This would execute malicious SQL!
```

**With Drizzle ORM (What You Have - SAFE):**
```typescript
// SAFE CODE - What you have
await db.select().from(users).where(eq(users.id, userId));
// Drizzle automatically escapes and parameterizes
// Impossible to inject malicious SQL
```

### Why SQL Injection Cannot Remove Users

Even if an attacker tried SQL injection (which won't work):

1. **Parameterized Queries**: All queries use bound parameters
2. **Input Validation**: Backend validates role values ('admin' or 'student' only)
3. **Authentication Required**: Only authenticated admins can access `/api/admin/users`
4. **Authorization Checks**: `isAdmin` middleware protects routes
5. **No Direct SQL Access**: Application uses ORM, not raw SQL strings

### Security Best Practices Already in Place

✅ **Authentication**: Users must log in
✅ **Authorization**: Only admins can manage users  
✅ **Input Validation**: Role values are validated
✅ **Parameterized Queries**: Drizzle ORM prevents injection
✅ **Audit Logging**: Role changes are logged
✅ **Self-Demotion Prevention**: Admins can't remove their own privileges
✅ **Admin Protection**: Admins can't demote other admins

### If You Need to Remove Users

**Proper way to delete users:**

1. **Add a DELETE endpoint** (currently not implemented):
   ```typescript
   app.delete('/api/admin/users/:id', isAuthenticated, isAdmin, async (req, res) => {
     // Implementation with proper validation
   });
   ```

2. **Add soft delete** (recommended):
   ```typescript
   // Mark user as deleted instead of actually deleting
   await db.update(users)
     .set({ deletedAt: new Date() })
     .where(eq(users.id, userId));
   ```

3. **Use direct database access** (for emergencies only):
   ```sql
   DELETE FROM users WHERE id = 'user-uuid-here';
   ```

---

## Summary

- **SQL Injection**: ✅ Protected by Drizzle ORM parameterized queries
- **Role Changes**: Protected by multiple layers of validation
- **Admin Demotion**: Intentionally prevented for security
- **User Deletion**: Not currently implemented in UI (must use database directly if needed)

Your application follows security best practices! 🎉

