# Call Flow Builder - Visual Mind Mapping for Calls

## 🎨 Twilio Studio-Style Call Flow Designer

A drag-and-drop visual interface for designing call routing flows, similar to Twilio Studio.

---

## ✨ Features

### **Visual Flow Designer**
- ✅ **Drag-and-drop canvas** with React Flow
- ✅ **6 node types** (Start, IVR, Queue, Condition, Voicemail, Hangup)
- ✅ **Visual connections** between nodes with arrows
- ✅ **Mini-map** for navigation
- ✅ **Grid background** for alignment
- ✅ **Zoom & pan controls**

### **Node Types**

#### 🟢 **Start Call** (Green)
- Entry point for incoming calls
- Automatically added to every flow

#### 🔵 **IVR Menu** (Blue)
- Interactive voice menu
- "Press 1 for..., Press 2 for..."
- Can route to multiple destinations

#### 🟣 **Queue** (Purple)
- Hold callers in queue
- Routes to available agents
- Plays hold music

#### 🟠 **Condition** (Orange)
- Check caller ID, time, or custom conditions
- Branch to different paths

#### ⚫ **Voicemail** (Gray)
- Send caller to voicemail
- Record message

#### 🔴 **Hang Up** (Red)
- End the call
- Terminal node

#### 🟡 **Time Check** (Yellow)
- Check business hours
- Route differently based on time

---

## 🎯 How to Use

### **Step 1: Access the Builder**
```
Login → Dashboard → Flow Builder
```
Only **Admin** and **Supervisor** roles can access (RBAC protected).

### **Step 2: Build Your Flow**

1. **Add Nodes:**
   - Click node type buttons on the left sidebar
   - Node appears on canvas
   - Drag to reposition

2. **Connect Nodes:**
   - Hover over a node
   - Drag from the connection point to another node
   - Arrow appears showing call flow

3. **Design Logic:**
   ```
   Start Call → IVR Menu
   IVR (Option 1) → Queue (Exams)
   IVR (Option 2) → Queue (Teacher Issues)
   IVR (Timeout) → Voicemail
   ```

### **Step 3: Save & Export**

1. **Save Flow:**
   - Give your flow a name
   - Click "Save" button
   - Stored in browser localStorage
   - Appears in "Saved Flows" panel

2. **Export as JSON:**
   - Click "Export JSON"
   - Downloads flow data
   - Can import later
   - Share with team

3. **Export as Asterisk Dialplan:**
   - Click "Export Dialplan"
   - Generates `.conf` file
   - Upload to Asterisk server
   - Reload dialplan

---

## 📊 Example Flows

### **Flow 1: Basic Ministry Call Center**
```
┌─────────────┐
│ Start Call  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  IVR Menu   │────► Option 1: Exam Issues
│             │────► Option 2: Teacher Complaints
│             │────► Option 3: School Facilities
│             │────► Timeout: Voicemail
└─────────────┘
       │
       ▼
 ┌──────────┐
 │  Queue   │
 └──────────┘
       │
       ▼
 ┌──────────┐
 │ Hang Up  │
 └──────────┘
```

### **Flow 2: Time-Based Routing**
```
┌─────────────┐
│ Start Call  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Time Check  │────► Business Hours: IVR Menu
│             │────► After Hours: Voicemail
└─────────────┘
```

### **Flow 3: VIP Caller Priority**
```
┌─────────────┐
│ Start Call  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Condition  │────► Ministry Official: Senior Agent
│ (Caller ID) │────► Other: Regular Queue
└─────────────┘
```

---

## 💾 Saved Flows

### **Features:**
- Flows saved to **localStorage**
- Persistent across sessions
- Shows node/edge count
- Creation timestamp
- Quick load button
- Delete option

### **Storage:**
```javascript
localStorage.getItem('callFlows')
// Returns array of flows:
[
  {
    id: "1234567890",
    name: "Ministry Call Flow",
    nodes: [...],
    edges: [...],
    createdAt: "2025-01-14T03:00:00.000Z"
  }
]
```

---

## 📤 Export Formats

### **1. JSON Export**
Perfect for backup, sharing, or version control.

```json
{
  "name": "Ministry Call Flow",
  "nodes": [
    {
      "id": "1",
      "type": "input",
      "data": { "label": "Incoming Call" },
      "position": { "x": 250, "y": 25 }
    },
    {
      "id": "2",
      "type": "default",
      "data": { "label": "IVR Menu", "nodeType": "ivr" },
      "position": { "x": 250, "y": 150 }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2"
    }
  ],
  "exportedAt": "2025-01-14T03:00:00.000Z"
}
```

### **2. Asterisk Dialplan Export**
Ready-to-use Asterisk configuration.

```ini
;
; Auto-generated from Call Flow Builder: Ministry Call Flow
; Generated at: 2025-01-14T03:00:00.000Z
;

[call-flow-ministry-call-flow]
exten => s,1,NoOp(IVR Menu)
same => n,Background(custom/menu)
same => n,WaitExten(10)

exten => 1,1,NoOp(Queue: Exam Issues)
same => n,Queue(exam_queue,t)
same => n,Hangup()

exten => 2,1,NoOp(Queue: Teacher Complaints)
same => n,Queue(teacher_queue,t)
same => n,Hangup()

exten => _X.,1,NoOp(Voicemail)
same => n,VoiceMail(100@default)
same => n,Hangup()
```

---

## 🎨 UI Components

### **Main Canvas**
- **Size:** Full screen with responsive layout
- **Grid:** Dots pattern for alignment
- **Controls:** Zoom in/out, fit view, lock
- **Mini-map:** Overview of entire flow

### **Left Sidebar - Toolbox**
- **Node type buttons** with icons
- **Color-coded** by function
- **One-click add** to canvas

### **Right Sidebar - Saved Flows**
- **Flow cards** with metadata
- **Load button** to restore
- **Delete button** to remove
- **Compact design** for many flows

### **Top Bar - Actions**
- **Flow name** input field
- **Save** button (green)
- **Export JSON** button
- **Export Dialplan** button
- **Clear** button (red)

### **Bottom Bar - Instructions**
- **4-step guide** for using the builder
- **Color-coded** information
- **Always visible** for reference

---

## 🔧 Technical Details

### **Libraries Used:**
```json
{
  "reactflow": "^11.x",
  "dagre": "^0.8.x"
}
```

### **React Flow Features:**
- Node dragging
- Edge connections
- Auto-routing arrows
- Minimap
- Controls panel
- Background patterns

### **State Management:**
```typescript
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
```

### **Node Structure:**
```typescript
interface Node {
  id: string;
  type: 'input' | 'default' | 'output';
  data: {
    label: React.ReactNode;
    nodeType?: string;
  };
  position: { x: number; y: number };
  style?: CSSProperties;
}
```

### **Edge Structure:**
```typescript
interface Edge {
  id: string;
  source: string;
  target: string;
  markerEnd?: { type: MarkerType };
  style?: CSSProperties;
}
```

---

## 🚀 Integration with Asterisk

### **Step 1: Design Flow in Builder**
1. Create your call routing logic visually
2. Test flow connections
3. Verify all paths covered

### **Step 2: Export Dialplan**
1. Click "Export Dialplan" button
2. Downloads `YourFlowName_extensions.conf`
3. Review generated dialplan

### **Step 3: Deploy to Asterisk**
```bash
# Copy to Asterisk config directory
sudo cp Ministry_Call_Flow_extensions.conf /etc/asterisk/

# Include in main dialplan
echo "#include extensions_custom.conf" >> /etc/asterisk/extensions.conf

# Reload Asterisk
asterisk -rx "dialplan reload"

# Verify
asterisk -rx "dialplan show call-flow-ministry-call-flow"
```

### **Step 4: Test**
```bash
# Make test call
# Should follow your designed flow
```

---

## 💡 Use Cases

### **1. Ministry Education Complaints**
```
Start → Time Check
  ├─ Business Hours → IVR
  │   ├─ 1: Exam Malpractice → Investigations Queue
  │   ├─ 2: Teacher Complaints → HR Queue  
  │   ├─ 3: School Facilities → Facilities Queue
  │   └─ Timeout → Voicemail
  └─ After Hours → Voicemail
```

### **2. VIP Caller Fast-Track**
```
Start → Caller ID Check
  ├─ Ministry Officials → Direct to Senior Agent
  └─ Regular Callers → Standard IVR Flow
```

### **3. Emergency Routing**
```
Start → IVR
  ├─ 1: Emergency → Priority Queue (no wait)
  ├─ 2: Urgent → High Priority Queue
  └─ 3: General → Standard Queue
```

### **4. Multi-Language Support**
```
Start → Language Selection IVR
  ├─ 1: English → English IVR Flow
  ├─ 2: Krio → Krio IVR Flow
  └─ 3: Mende → Mende IVR Flow
```

---

## 📋 Best Practices

### **Flow Design:**
1. **Keep it simple** - Don't create overly complex flows
2. **Always have fallbacks** - Handle timeouts and invalid inputs
3. **Test all paths** - Verify every connection works
4. **Document nodes** - Use clear, descriptive labels
5. **Version control** - Save multiple iterations

### **Node Placement:**
1. **Top to bottom** - Start at top, end at bottom
2. **Left to right** - Main flow left, alternatives right
3. **Use grid** - Align nodes for clean look
4. **Space evenly** - Don't cluster nodes
5. **Color meaning** - Let colors guide logic

### **Connections:**
1. **One entry point** - Single start node
2. **Clear exits** - Obvious end points
3. **No loops** - Avoid circular references (for now)
4. **Label edges** - Add descriptions if complex
5. **Test connections** - Ensure arrows point correctly

---

## 🎯 Roadmap / Coming Soon

### **Phase 1: Enhanced Nodes** ✅ (Done)
- Basic node types
- Visual connections
- Save/Load flows

### **Phase 2: Advanced Features** (Next)
- [ ] **Edit node properties** - Click to configure
- [ ] **Node settings panel** - Set queue names, timeouts, etc.
- [ ] **Edge labels** - Name connections (e.g., "Option 1")
- [ ] **Conditional routing** - Complex logic branches
- [ ] **Variables** - Store caller data

### **Phase 3: Real-Time Integration**
- [ ] **Backend API** - Save flows to database
- [ ] **Live deployment** - Auto-update Asterisk
- [ ] **Flow testing** - Simulate calls through flow
- [ ] **Analytics** - Track calls through each node
- [ ] **A/B testing** - Compare flow performance

### **Phase 4: Collaboration**
- [ ] **Multi-user editing** - Team collaboration
- [ ] **Comments** - Add notes to nodes
- [ ] **Version history** - Track changes
- [ ] **Templates** - Pre-built flow templates
- [ ] **Import/Export** - Share between systems

---

## 🔐 RBAC Permissions

### **Who Can Access:**
- ✅ **Admin** - Full access, edit everything
- ✅ **Supervisor** - View and create flows
- ❌ **Agent** - No access
- ❌ **Analyst** - No access
- ❌ **Auditor** - No access

### **Permissions:**
```typescript
canViewCallFlowBuilder: boolean
// admin: true
// supervisor: true
// others: false
```

---

## 📖 Quick Reference

### **Keyboard Shortcuts:**
```
Drag Canvas:    Click + Drag background
Select Node:    Click node
Delete Node:    Select + Delete key
Delete Edge:    Click edge + Delete key
Zoom In:        Ctrl/Cmd + Mouse Wheel Up
Zoom Out:       Ctrl/Cmd + Mouse Wheel Down
Fit View:       Click fit view button
```

### **Canvas Controls:**
```
🔍 Zoom In         - Plus button
🔍 Zoom Out        - Minus button
📐 Fit to View     - Expand button
🔒 Lock/Unlock     - Lock button
🗺️  Mini Map        - Small overview map
```

---

## 🎓 Tutorial: Your First Flow

### **Goal:** Create a simple complaint routing flow

**Step 1: Start**
- Already has Start Call node (green)

**Step 2: Add IVR Menu**
- Click "IVR Menu" button (blue)
- Drag new node below Start Call
- Connect Start Call → IVR Menu

**Step 3: Add Queues**
- Click "Queue" button 3 times
- Drag them in a row below IVR
- Label them mentally as:
  - Exam Queue
  - Teacher Queue
  - Facilities Queue

**Step 4: Connect IVR to Queues**
- Drag from IVR Menu to first Queue
- Drag from IVR Menu to second Queue
- Drag from IVR Menu to third Queue

**Step 5: Add Hang Up**
- Click "Hang Up" button (red)
- Drag below queues
- Connect all 3 queues to Hang Up

**Step 6: Save**
- Name it "Basic Complaint Flow"
- Click Save
- Appears in right sidebar

**Step 7: Export**
- Click "Export Dialplan"
- Review generated config
- Ready to deploy!

---

## 🎉 You're Ready!

You now have a powerful visual tool for designing call flows:
- ✅ **Drag-and-drop** interface
- ✅ **Save & load** flows
- ✅ **Export to JSON** for backup
- ✅ **Generate Asterisk dialplan** automatically
- ✅ **RBAC protected** for admin/supervisor only
- ✅ **Intuitive design** similar to Twilio Studio

Start building your Ministry call routing flows visually! 🎨📞

