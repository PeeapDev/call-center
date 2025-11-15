# 📱 Quick Test Guide - Mobile Improvements

## 🚀 Start Testing Now

### 1. Restart Backend (to apply userId field)

```bash
cd backend

# Stop current backend
lsof -ti:3001 | xargs kill -9

# Start fresh
npm run start:dev
```

**Wait for**: `Nest application successfully started`

---

### 2. Start Mobile App

```bash
cd mobile-app/ministry-call-center

# Install new dependencies (if needed)
npm install

# Start Expo
npx expo start
```

**Scan QR code** with Expo Go app

---

### 3. Test User ID System

#### a) Fresh Login:
1. **Login** as Citizen (phone: 077123456)
2. App generates unique ID automatically
3. Notice: No more "back" button needed - **see footer tabs!** 🎉

#### b) Check User ID:
1. Tap **👤 Profile** tab (bottom right)
2. Look for "User ID" row
3. Should see: `user_1736948...`
4. ✅ **This proves user ID is working!**

---

### 4. Test Bottom Navigation

**Try tapping each tab**:
1. **🏠 Home** → Landing screen
2. **📞 Call** → Call screen (no back button!)
3. **💬 Chat** → Chat screen
4. **🕐 History** → Call history (NEW!)
5. **👤 Profile** → Your profile (NEW!)

**Notice**:
- Active tab is **blue**
- Blue bar at top of active tab
- Smooth transitions
- Always visible footer
- **Feels native!** ✅

---

### 5. Test Call with User ID

1. Tap **📞 Call** tab
2. Select service: "🎓 Exam Malpractice"
3. Tap "Call Now"
4. Call initiates

**Check backend logs**:
```
📞 Initiating call via API: {
  phoneNumber: '+232 77 123 456',
  ivrOption: '1',
  userId: 'user_1736948400_abc123'  ← YOUR ID!
}
```

5. Let call run for ~10 seconds
6. Tap "Hang Up"

---

### 6. Test Call History

1. Tap **🕐 History** tab
2. **Should see your call!** 📞
3. Notice:
   - Call statistics (1 Total, 1 Completed, etc.)
   - Recent calls list
   - Service name with emoji
   - Duration (e.g., "0m 10s")
   - Status (completed)
   - Timestamp ("Today at 1:23 PM")

**✅ This proves history saving works!**

---

### 7. Test Offline Support

1. Make another call (so you have 2 in history)
2. **Turn OFF WiFi on your phone**
3. **Close the app completely** (swipe up)
4. **Reopen the app**

**What should happen**:
- ✅ App opens instantly (no loading!)
- ✅ Still logged in
- ✅ Tap History → Calls still visible
- ✅ Tap Profile → Data still visible
- ✅ **Everything works offline!**

5. Turn WiFi back ON
6. Pull down on History screen to refresh
7. **✅ Syncs with server**

---

### 8. Test Persistence

1. **Force close the app**
2. **Restart your phone** (optional but thorough)
3. **Reopen the app**

**What should happen**:
- ✅ No login screen (still logged in!)
- ✅ Same user ID in profile
- ✅ Call history still there
- ✅ No data lost

---

### 9. Verify User ID in Backend Database

**Option A - Check logs**:
```bash
# In backend terminal, look for logs like:
📢 Notified agents about incoming call [call-uuid]
⏳ Call [call-uuid] placed in queue position 1

# Check call was saved with userId
```

**Option B - Check database**:
```bash
cd backend

# Open SQLite database
sqlite3 callcenter.db

# Query recent call
SELECT id, phoneNumber, userId, callerName, ivrOption 
FROM calls 
ORDER BY createdAt DESC 
LIMIT 1;

# Should show your userId!
```

---

## 🎯 Expected Results

### ✅ Checklist

- [x] App has bottom navigation footer
- [x] Profile shows unique user ID
- [x] Calls include user ID in backend
- [x] History screen shows past calls
- [x] History has statistics dashboard
- [x] Call history saves automatically
- [x] App works offline (history, profile)
- [x] User stays logged in after restart
- [x] No more back buttons (navigation via footer)
- [x] Smooth animations between tabs
- [x] Native mobile feel

---

## 🎨 Visual Confirmation

### You Should See:

**Footer Navigation**:
```
┌─────────────────────────────────────┐
│                                     │
│         (App Content)               │
│                                     │
├─────────────────────────────────────┤
│ 🏠    📞    💬    🕐    👤        │
│ Home  Call  Chat  Hist  Profile    │
│ ━━━━                                │ ← Blue bar on active
└─────────────────────────────────────┘
```

**History Screen**:
```
┌─────────────────────────────────────┐
│          Call History               │
│      +232 77 123 456                │
├─────────────────────────────────────┤
│ ┌────┐  ┌────┐  ┌────┐            │
│ │  2 │  │  2 │  │ 8m │            │
│ │Total│  │Done│  │Time│            │
│ └────┘  └────┘  └────┘            │
└─────────────────────────────────────┘
```

**Profile Screen**:
```
┌─────────────────────────────────────┐
│            ┌───┐                    │
│            │ C │                    │
│            └───┘                    │
│           Citizen                   │
│       +232 77 123 456               │
│                                     │
│  🆔 User ID  user_1736948...       │
│  📱 Phone    +232 77 123 456       │
│  👤 Type     citizen                │
└─────────────────────────────────────┘
```

---

## 🐛 Common Issues

### Issue: "Cannot find userId in call logs"
**Solution**: 
- Restart backend (database schema changed)
- Make a new call
- Check logs again

### Issue: "History tab is empty"
**Solution**:
- Make at least one call first
- Hang up properly
- Check History tab again

### Issue: "App asks to login again"
**Solution**:
- This is normal if you reinstalled app
- Login once, then it persists
- Don't clear app data

### Issue: "No footer navigation visible"
**Solution**:
- Make sure you're logged in
- Footer only shows after login
- Check you're not on login screen

---

## 📊 Backend Verification

**Check call has userId**:

```bash
# In backend terminal
cd backend

# Watch logs when call is made
# You should see:
{
  phoneNumber: '+232 77 123 456',
  ivrOption: '1',
  callerName: 'User user_173',
  userId: 'user_1736948400_abc123def'  ← PRESENT!
}
```

---

## 🎉 Success Indicators

If you see ALL of these, **everything is working**:

1. ✅ Footer with 5 tabs always visible
2. ✅ Profile shows your unique ID
3. ✅ History shows call list + stats
4. ✅ Calls work and save to history
5. ✅ App opens instantly (no lag)
6. ✅ History loads instantly offline
7. ✅ Profile loads instantly offline
8. ✅ User stays logged in after restart
9. ✅ No more scattered "back" buttons
10. ✅ **App feels like a real native app!**

---

## 🚀 Quick 2-Minute Test

**Fastest way to verify**:

```bash
# 1. Start backend
cd backend && npm run start:dev

# 2. Start mobile (new terminal)
cd mobile-app/ministry-call-center && npx expo start

# 3. In mobile app:
- Login as citizen
- Tap Profile tab → See user ID? ✅
- Tap Call tab → Make call
- Hang up after 5 seconds
- Tap History tab → See call? ✅
- Close app completely
- Reopen → Still logged in? ✅
- History still there? ✅

# ALL ✅ = SUCCESS! 🎉
```

---

## 📱 Next Steps After Testing

Once everything works:

1. **Test with real phone number** (yours)
2. **Make multiple calls** (build history)
3. **Test offline mode** thoroughly
4. **Share app with test users**
5. **Collect feedback**

---

**You now have a fully native mobile app with user tracking, offline support, and persistent navigation!** 🎉

Need help? Check:
- Backend logs for errors
- Mobile app Expo logs  
- Database for saved calls
- AsyncStorage for cached data
