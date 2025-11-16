# Create Admin Account

Since you're locked out, here are two ways to create an admin account:

## Option 1: Using the Backend API (Recommended)

Run this command in your terminal:

```bash
curl -X POST http://localhost:3001/hr/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "phoneNumber": "+23276000000",
    "password": "admin123",
    "accountType": "admin"
  }'
```

Then login with:
- Phone: `+23276000000`
- Password: `admin123`

## Option 2: Directly in PostgreSQL Database

1. Open PostgreSQL:
```bash
psql -U postgres -d callcenter
```

2. Run this SQL (password is hashed for "admin123"):
```sql
INSERT INTO "user" (
  id, 
  name, 
  "phoneNumber", 
  password, 
  "accountType", 
  "isActive"
) VALUES (
  gen_random_uuid(),
  'Admin User',
  '+23276000000',
  '$2b$10$YourHashedPasswordHere',  -- You need to hash this
  'admin',
  true
);
```

**Note:** For Option 2, you need to hash the password first. Use this Node.js command:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

Then replace `$2b$10$YourHashedPasswordHere` with the output.

## Verify Admin Account

After creating, login at:
- http://localhost:3000/login
- Phone: `+23276000000`
- Password: `admin123`
