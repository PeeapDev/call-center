# Testing Citizen Registration & Call Flow

Complete guide to test the citizen registration, login, and calling system.

---

## 🎯 Complete Testing Flow

### Phase 1: Admin Setup (You are already logged in as admin)

1. **Login as Admin**
   - Go to: http://localhost:3000/login
   - Phone: `+23276000000`
   - Password: `admin123`

2. **Check Asterisk Status**
   - Once logged in, check dashboard
   - Should show: **"Asterisk Connected"** (if you started Docker)
   - Or: **"Mock Mode"** (if Asterisk not running)

3. **View User Management**
   - Look in sidebar → **"User Management"** (new!)
   - Currently shows 0 citizens
   - This will update when citizens register

---

### Phase 2: Start Asterisk (For Real Calls)

If you want to make **real calls** (not mock):

```bash
# Make sure Docker Desktop is running first!

# Start Asterisk
cd /Users/soft-touch/Desktop/project/callcenter
docker compose -f docker-compose.asterisk.yml up -d

# Verify it's running
docker ps | grep asterisk

# Check Asterisk logs
docker logs -f callcenter-asterisk

# Test ARI connection
curl -u callcenter:change_me_ari http://localhost:8088/ari/asterisk/info
```

**Restart your backend** to detect Asterisk:
```bash
cd backend
npm run start:dev
```

---

### Phase 3: Register as Citizen

1. **Open Registration Page**
   - Go to: http://localhost:3000/register
   - Or click "Register" link on login page

2. **Fill Registration Form**
   - Full Name: `John Kamara` (or any name)
   - Phone: `+23276111111` (must start with +232)
   - Password: `citizen123` (at least 6 characters)
   - Confirm Password: `citizen123`
   - Click **"Register Account"**

3. **Success!**
   - You'll see: "Registration successful!"
   - Auto-redirects to login page

---

### Phase 4: View Citizen in Admin Dashboard

1. **Switch back to Admin account** (if needed)
   - Login as: `+23276000000` / `admin123`

2. **Go to User Management**
   - Sidebar → **User Management**
   - You should see:
     - **Total Users: 1**
     - **Active Users: 1**
     - The citizen you just registered: **John Kamara** with phone `+23276111111`

3. **Citizen Details Show**:
   - Name
   - Phone number
   - Account type: **citizen**
   - Status: **Active** (green badge)
   - Join date
   - Actions: Deactivate, View, Delete

4. **Search & Filter**
   - Try searching by name: "John"
   - Try searching by phone: "111111"
   - Filter by: All, Citizens, Active, Inactive

---

### Phase 5: Login as Citizen

1. **Logout from Admin**
   - Click on your profile → Sign Out

2. **Login as Citizen**
   - Phone: `+23276111111`
   - Password: `citizen123`
   - Click **Sign In**

3. **Citizen Dashboard**
   - You should see a simplified dashboard
   - Limited access (no admin features)
   - Can see: My Calls, Make a Call

---

### Phase 6: Make a Call as Citizen

**Option A: If Asterisk is Running (Real Call)**

1. In citizen dashboard, go to "My Calls" or "Active Calls"
2. Click "Make Call" or "Call 117" (emergency hotline)
3. System routes through Asterisk
4. Call enters queue
5. Agent can pick up (if agent is online)

**Option B: If No Asterisk (Mock Mode)**

1. System will simulate call in mock mode
2. You can test the UI flow
3. Call appears in "Active Calls" section
4. Mock data is displayed

---

### Phase 7: Admin Views Citizen Calls

1. **Login back as Admin**: `+23276000000` / `admin123`

2. **Go to User Management**
   - See the citizen you created
   - View their details
   - See registration date, status

3. **Go to Active Calls** (if citizen made a call)
   - See real-time call from citizen
   - Monitor call status

4. **Go to Dashboard**
   - See stats updated with citizen call data
   - Monitor system health

---

## 📊 What Admin Can Do in User Management

### View All Citizens
- See complete list of registered citizens
- Search by name or phone
- Filter by status (active/inactive)

### Manage Citizens
- **Deactivate**: Disable a user account (they can't login)
- **Activate**: Re-enable a disabled account
- **Delete**: Permanently remove a user (requires confirmation)
- **View**: See detailed user information

### Stats Dashboard
- **Total Users**: All registered citizens
- **Active Users**: Can login and make calls
- **Inactive Users**: Disabled accounts
- **Citizens**: All public users

---

## 🎯 Complete Test Checklist

### Registration & Login
- [ ] Citizen can register at `/register`
- [ ] Registration validates phone number format (+232)
- [ ] Registration validates password length (min 6)
- [ ] Registration checks password confirmation
- [ ] Success message shows after registration
- [ ] Auto-redirects to login after 2 seconds
- [ ] Citizen can login with phone + password
- [ ] Citizen sees their own dashboard

### Admin User Management
- [ ] Admin sees "User Management" in sidebar
- [ ] User Management shows all citizens
- [ ] Stats cards display correct counts
- [ ] Search by name works
- [ ] Search by phone works
- [ ] Filter by "All" works
- [ ] Filter by "Citizens" works
- [ ] Filter by "Active" works
- [ ] Filter by "Inactive" works
- [ ] Deactivate user works
- [ ] Activate user works
- [ ] Delete user works (with confirmation)

### Call System (With Asterisk)
- [ ] Asterisk container is running
- [ ] Backend shows "Asterisk Connected"
- [ ] Dashboard shows "Asterisk Connected"
- [ ] Citizen can initiate call to 117
- [ ] Call appears in Active Calls
- [ ] Agent can see incoming call
- [ ] Call can be answered
- [ ] Call can be ended

---

## 🚀 Quick Start Commands

```bash
# Terminal 1: Start Asterisk
docker compose -f docker-compose.asterisk.yml up -d

# Terminal 2: Start Backend
cd backend
npm run start:dev

# Terminal 3: Start Frontend
cd frontend
npm run dev

# Open Browser
# Admin: http://localhost:3000/login
# Register: http://localhost:3000/register
```

---

## 📝 Test Data

### Admin Account
- Phone: `+23276000000`
- Password: `admin123`

### Test Citizen (Register yourself)
- Name: Any name
- Phone: `+232` + any 8 digits
- Password: At least 6 characters

---

## ✅ What's Working Now

1. ✅ **Citizen Registration** - Complete self-service registration
2. ✅ **Phone-Based Auth** - No emails needed
3. ✅ **User Management** - Admin can view all citizens
4. ✅ **Search & Filter** - Find users easily
5. ✅ **Activate/Deactivate** - Control user access
6. ✅ **Delete Users** - Remove users permanently
7. ✅ **Stats Dashboard** - Real-time user counts
8. ✅ **Asterisk Integration** - Ready for real calls

---

## 🎉 You Can Now

As **Citizen**:
- ✅ Register for an account
- ✅ Login with phone + password
- ✅ View your dashboard
- ✅ Make calls to hotline (117)
- ✅ Track your cases

As **Admin**:
- ✅ See all registered citizens
- ✅ Search and filter users
- ✅ Activate/deactivate accounts
- ✅ Delete users
- ✅ Monitor user activity
- ✅ View registration dates

---

**All changes committed and pushed to `agent` branch!** 🚀

Try the complete flow now and let me know if you encounter any issues!
