# 🔐 Auth System Implementation Plan

## ✅ Completed
1. Git operations - Created `auth` branch
2. Fixed footer navigation - Now uses absolute positioning to stay fixed

## 🚧 To Implement

### 1. Backend - Authentication System
- [ ] Create User entity (citizens and staff)
- [ ] Registration API (phone + password)
- [ ] Login API (phone + password)
- [ ] Password reset API
- [ ] Staff account management API
- [ ] JWT authentication

### 2. Mobile App - Setup Wizard
- [ ] Welcome screen
- [ ] Phone number + password registration
- [ ] Multi-step wizard:
  - Step 1: Name ("What should we call you?")
  - Step 2: User type (Student/Parent/Teacher/Staff)
  - Step 3: Additional info (optional)
- [ ] Welcome animation (Lottie)
- [ ] Save wizard completion flag (AsyncStorage)

### 3. Mobile App - Call Detection
- [ ] Detect incoming phone calls (native module)
- [ ] Block outgoing calls when phone is ringing
- [ ] Show friendly message if call in progress

### 4. Mobile App - Redesigned Dashboard
- [ ] New modern dashboard for citizens
- [ ] Quick action cards
- [ ] Recent activity feed
- [ ] Service shortcuts
- [ ] Emergency contact banner

### 5. Web - Citizen Login
- [ ] Add citizen/staff toggle on login page
- [ ] Change "Staff Account" to "Login"
- [ ] Separate authentication for citizens vs staff
- [ ] Citizen dashboard view (simple)

### 6. Real Staff Account
- [ ] Staff registration/creation API
- [ ] Staff management in admin panel
- [ ] Remove all mock staff data
- [ ] Staff permissions system

## 📝 Current Focus
Starting with Backend Authentication System...
