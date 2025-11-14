# Ministry of Education Call Center System

A comprehensive call center management system built for the Ministry of Education in Sierra Leone, featuring real-time call routing, AI analytics, staff management with QR attendance, and case/ticket management.

## 🌟 Features

### 📞 Call Management
- **Real-time Dashboard** - Monitor active calls, queue stats, and agent performance
- **Call Flow Builder** - Visual drag-and-drop interface (Twilio Studio-style)
- **Intelligent Routing** - Priority-based routing with IVR support
- **Call Recording** - Automatic recording with playback
- **WebRTC Integration** - Browser-based calling
- **Asterisk Integration** - Auto-generated dialplans

### 🎫 Case/Ticket Management
- **Priority System** - Critical, Urgent, High, Medium, Low
- **Call Linking** - Link voice recordings to cases
- **Auto Reference Numbers** - CASE-2025-0001 format
- **Duration Tracking** - Automatic resolution time calculation
- **Search & Filter** - Find cases by status, priority, category
- **Notes & Attachments** - Full case documentation

### 👥 Staff/HR Management
- **QR Code Generation** - Auto-generated on staff enrollment
- **QR Attendance Tracking** - Check-in/Check-out via QR scan
- **Late Detection** - Automatic status based on schedule
- **Attendance Reports** - Daily, weekly, monthly statistics
- **Staff Profiles** - Complete employee information
- **Work Schedules** - Customizable per staff member

### 🤖 AI Features
- **DeepSeek AI Integration** - Intelligent chatbot for citizens
- **Sentiment Analysis** - Real-time call emotion tracking
- **AI Analytics** - Call trends and insights
- **Anonymous Chat** - Privacy-focused citizen support

### 📊 Analytics & Reporting
- **Real-time Metrics** - Live dashboard with key KPIs
- **Call Analytics** - Duration, resolution rates, trends
- **Agent Performance** - Individual and team statistics
- **Case Statistics** - Resolution time, priority distribution
- **Attendance Reports** - Staff presence tracking

### 🔐 Role-Based Access Control (RBAC)
- **Admin** - Full system access
- **Supervisor** - Monitoring and oversight
- **Agent** - Simplified call handling interface
- **Analyst** - Analytics and reporting only
- **Auditor** - View-only compliance access

### 🎨 Content Management
- **Blog Posts** - Public information portal
- **FAQ System** - Self-service knowledge base
- **Guidelines** - Dos & Don'ts for citizens
- **Landing Page** - Ministry-branded public portal

## 🏗️ Architecture

### Backend (NestJS)
```
backend/
├── src/
│   ├── asterisk/       # Asterisk PBX integration
│   ├── routing/        # Call routing rules & dialplan generation
│   ├── staff/          # Staff management & QR attendance
│   ├── cases/          # Case/ticket management
│   ├── chat/           # AI chatbot (DeepSeek)
│   ├── api-keys/       # API key management
│   └── app.module.ts
├── callcenter.db       # SQLite database
└── package.json
```

### Frontend (Next.js 13)
```
frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Main dashboard
│   │   │   ├── agent/                # Agent-specific view
│   │   │   ├── routing/              # Call routing config
│   │   │   ├── call-flow-builder/    # Visual flow designer
│   │   │   ├── my-calls/             # Call history
│   │   │   ├── analytics/            # AI analytics
│   │   │   ├── content/              # Content management
│   │   │   ├── settings/             # System settings
│   │   │   └── webrtc-setup/         # WebRTC configuration
│   │   ├── landing/                  # Public portal
│   │   └── login/                    # Authentication
│   ├── components/
│   │   ├── ChatBot.tsx               # AI chatbot
│   │   └── AgentCallInterface.tsx    # Call handling UI
│   └── lib/
│       ├── auth.ts                   # NextAuth configuration
│       └── rbac.ts                   # Role permissions
└── package.json
```

### Database
- **SQLite** (development)
- **PostgreSQL-ready** (production)
- **TypeORM** for migrations and management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/PeeapDev/call-center.git
cd call-center
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Environment**

Backend `.env`:
```env
PORT=3001
DATABASE_URL=sqlite:./callcenter.db
ASTERISK_DIALPLAN_PATH=./docker/asterisk/conf/extensions_custom.conf
DEEPSEEK_API_KEY=your_api_key_here
```

Frontend `.env.local`:
```env
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

5. **Start Backend**
```bash
cd backend
npm run start:dev
```

6. **Start Frontend**
```bash
cd frontend
npm run dev
```

7. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@education.gov | admin123 |
| Supervisor | supervisor@education.gov | super123 |
| Agent | agent@education.gov | agent123 |
| Analyst | analyst@education.gov | analyst123 |
| Auditor | auditor@education.gov | auditor123 |

## 📡 API Endpoints

### Staff Management
```
GET    /staff                        # List all staff
POST   /staff                        # Create staff (auto-generates QR)
GET    /staff/:id                    # Get staff details
PUT    /staff/:id                    # Update staff
DELETE /staff/:id                    # Delete staff
POST   /staff/attendance/check-in    # QR check-in
POST   /staff/attendance/check-out   # QR check-out
GET    /staff/attendance/today       # Today's attendance
GET    /staff/stats                  # Attendance statistics
```

### Case Management
```
GET    /cases                    # List cases (with filters)
POST   /cases                    # Create case
GET    /cases/:id                # Get case details
PUT    /cases/:id                # Update case
DELETE /cases/:id                # Delete case
GET    /cases/stats              # Case statistics
GET    /cases/search?q=          # Search cases
POST   /cases/:id/link-call      # Link call recording
POST   /cases/:id/notes          # Add note to case
```

### Call Routing
```
GET    /routing                      # Get all routing rules
POST   /routing                      # Create routing rule
PUT    /routing/:id                  # Update rule
DELETE /routing/:id                  # Delete rule
GET    /routing/simulate             # Simulate call routing
POST   /routing/seed                 # Create default rules
GET    /routing/regenerate-dialplan  # Generate Asterisk config
```

### AI Chat
```
POST   /chat                 # Send message to AI
GET    /chat/status          # Check AI configuration
```

### API Keys
```
GET    /api-keys             # Get all API keys (masked)
PUT    /api-keys/:key        # Update API key
DELETE /api-keys/:key        # Delete API key
```

## 🎯 Key Workflows

### 1. Call Routing Flow
```
Incoming Call
    ↓
Time Check (Business hours?)
    ↓
IVR Menu (Press 1-4)
    ↓
Routing Rules (Priority-based)
    ↓
Queue Assignment
    ↓
Agent Answer
    ↓
Create Case (Link recording)
    ↓
Resolve & Close
```

### 2. Staff Attendance Flow
```
Staff Enrollment
    ↓
QR Code Generated (STAFF-{uuid})
    ↓
Print/Display QR Code
    ↓
Staff Scans QR (Check-in)
    ↓
System Records: Time, Location, Status
    ↓
Staff Scans QR (Check-out)
    ↓
Calculate Work Hours
```

### 3. Case Management Flow
```
Citizen Calls
    ↓
Agent Answers & Creates Case
    ↓
System Links Call Recording
    ↓
Assign Priority & Category
    ↓
Supervisor Assigns to Specialist
    ↓
Investigation & Updates
    ↓
Resolve Case
    ↓
System Calculates Duration
    ↓
Close Case
```

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS
- **Database**: TypeORM + SQLite/PostgreSQL
- **Authentication**: JWT
- **QR Codes**: qrcode library
- **AI**: DeepSeek API
- **PBX**: Asterisk AMI

### Frontend
- **Framework**: Next.js 13 (App Router)
- **UI**: React + TailwindCSS
- **Components**: shadcn/ui
- **Auth**: NextAuth.js
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Flow Builder**: React Flow
- **Icons**: Lucide React

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Environment**: Node.js
- **Deployment**: Docker (optional)

## 📚 Documentation

- [Complete System Summary](./COMPLETE_SYSTEM_SUMMARY.md)
- [RBAC & Routing Guide](./RBAC_AND_REAL_ROUTING_GUIDE.md)
- [Call Flow Builder Guide](./CALL_FLOW_BUILDER_GUIDE.md)
- [Call System Guide](./CALL_SYSTEM_GUIDE.md)

## 🔧 Development

### Backend Development
```bash
cd backend
npm run start:dev     # Start in watch mode
npm run build         # Build for production
npm run test          # Run tests
```

### Frontend Development
```bash
cd frontend
npm run dev           # Start dev server
npm run build         # Build for production
npm run lint          # Run linter
```

### Database Migrations
```bash
cd backend
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

## 🚢 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

### Environment Variables (Production)
- Set `NODE_ENV=production`
- Use PostgreSQL instead of SQLite
- Set strong `NEXTAUTH_SECRET`
- Configure proper `ASTERISK_DIALPLAN_PATH`
- Add production `DEEPSEEK_API_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👏 Acknowledgments

- Ministry of Education, Sierra Leone
- DeepSeek AI for intelligent chatbot
- Asterisk PBX community
- Next.js and NestJS teams

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@education.gov.sl

---

**Built with ❤️ for the Ministry of Education, Sierra Leone** 🇸🇱
