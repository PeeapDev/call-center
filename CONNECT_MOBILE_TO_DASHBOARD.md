# 🔗 Connect Mobile Calls to Web Dashboard

## Current Situation

**Mobile App** → Calls backend → Assigns to **mock agents** (Sarah, Mohamed, Fatmata)  
**Web Dashboard** → Agents logged in but DON'T see mobile calls

## The Problem

The backend uses mock agents instead of real logged-in dashboard agents:

```typescript
// backend/src/calls/calls.service.ts (lines 11-32)
private mockAgents = [
  { id: 'agent_1', name: 'Sarah Johnson', ... },
  { id: 'agent_2', name: 'Mohamed Kamara', ... },
  { id: 'agent_3', name: 'Fatmata Sesay', ... },
];
```

These are **fake agents**, not the ones in your dashboard!

---

## Solution Options

### Option 1: Quick Fix - Show Calls in Dashboard (30 minutes)
Display incoming mobile calls in the "My Calls" page where agents can see them.

### Option 2: Full Integration - Real-time Notifications (2-3 hours)
WebSocket notifications that pop up on agent dashboard when mobile calls come in.

### Option 3: Complete System - Agent Routing (1-2 days)
Full integration with agent status, skills, and automatic call distribution.

---

## Let's Do Option 1 First (Quick Win)

### Step 1: Create endpoint to list active calls for agents

I'll create a new endpoint that shows ALL calls (including mobile app calls) in the agent dashboard.

### Step 2: Update My Calls page to show mobile calls

The "My Calls" page will fetch and display calls from mobile app users.

### Step 3: Add "Answer Call" button

Agents can click to accept mobile calls.

---

## Implementation

Let me create this now...
