# Ministry of Education Digital Call Center System 🇸🇱

## Open-Source Cloud-Based Call Center Solution for Public Sector Organizations

**Built by School District Sierra Leone** | **Empowering the Ministry of Education**

A revolutionary, fully-digitalized call center infrastructure that eliminates the need for expensive physical server setups while seamlessly integrating with local toll-free numbers. This open-source solution enables government ministries and organizations to modernize their citizen engagement at a fraction of traditional costs.

---

## 📖 Table of Contents

- [About the Project](#about-the-project)
- [The Problem We Solve](#the-problem-we-solve)
- [Our Solution](#our-solution)
- [System Architecture](#system-architecture)
- [How It Works](#how-it-works)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Roles & Permissions](#roles--permissions)
- [Offline Capabilities](#offline-capabilities)
- [Scalability & Performance](#scalability--performance)
- [Use Cases](#use-cases)
- [Support](#support)

---

## 📋 About the Project

### Background

School District Sierra Leone has successfully deployed a centralized school management system currently operational in multiple schools across the country. Building on this success, we developed this open-source call center solution specifically for the Ministry of Education, with the vision of making it available to other government organizations and institutions.

### Vision

To democratize access to modern call center technology by providing a cloud-based, cost-effective alternative to traditional physical infrastructure, while maintaining the reliability and familiarity of local telephone systems.

### Mission

Enable government ministries and public sector organizations in Sierra Leone and beyond to:
  Nice
- **Improve Citizen Services** through faster response times and better call management
- **Digitalize Operations** completely, eliminating manual processes
- **Scale Effortlessly** as call volumes and staff grow
- **Maintain Accessibility** by integrating with existing toll-free numbers

---

## 🎯 The Problem We Solve

### Traditional Call Center Challenges

#### 1. **Prohibitive Infrastructure Costs**
Traditional call centers require:
- Physical server rooms with cooling and power backup
- Multiple servers for redundancy
- Network infrastructure and cabling
- Ongoing maintenance contracts

**For many ministries and organizations, these costs are simply unaffordable.**

#### 2. **Geographic Limitations**
- Agents must work from a central location
- Difficult to hire talent from across the country
- Single point of failure if office becomes inaccessible
- Limited disaster recovery options

#### 3. **Scalability Issues**
- Adding new agents requires hardware upgrades
- Seasonal call volume spikes overwhelm systems
- Expansion means purchasing more equipment
- Cannot easily test or pilot programs

#### 4. **Management Complexity**
- Manual attendance tracking prone to errors
- Difficult to monitor agent performance in real-time
- No centralized view of operations
- Limited analytics and reporting

#### 5. **Integration Challenges**
- Toll-free numbers isolated from digital systems
- Cannot leverage mobile or remote capabilities
- Poor integration with modern tools
- Limited citizen self-service options

---

## ✨ Our Solution

### A Hybrid Cloud-Local Architecture

Our system combines the best of both worlds:

#### **Cloud-Based Management** (Reduces Costs)
- All management interfaces run in the cloud
- No physical servers needed for administration
- Access from anywhere with internet
- Automatic updates and maintenance


#### **Local Telephony Integration** (Maintains Reliability)
- Direct connection to the ministry toll-free numbers
- Calls remain on local telecom networks
- No international routing costs
- Works with existing phone infrastructure
- Familiar experience for citizens

### How This Saves Money

### Key Benefits
 
✅ **Scalable**: Add agents without hardware purchases  
✅ **Accessible**: Work from anywhere with internet  
✅ **Integrated**: Connects local phones with digital tools  
✅ **Modern**: AI, analytics, and automation built-in  
✅ **Open-Source**: No vendor lock-in, full customization  
✅ **Reliable**: Cloud redundancy + local telephony  
✅ **Fast Deployment**: Operational in days, not months  

---

## 🏗️ System Architecture

### High-Level Overview

```mermaid
graph TB
    subgraph "Citizens"
        A[Mobile Phone Calls<br/>Toll-Free: 117]
        B[Web Portal<br/>Landing Page]
        C[AI Chatbot<br/>Anonymous Support]
    end
    
    subgraph "Entry Points"
        D[Local Telecom Network<br/>Sierra Leone]
        E[Public Website<br/>education.gov.sl]
    end
    
    subgraph "Cloud Infrastructure"
        F[Asterisk PBX<br/>Call Distribution]
        G[Backend API<br/>NestJS]
        H[Database<br/>PostgreSQL]
        I[AI Engine<br/>DeepSeek]
    end
    
    subgraph "Management Dashboard"
        J[Admin Portal<br/>Call Routing & Config]
        K[Supervisor View<br/>Monitoring & Analytics]
        L[Agent Interface<br/>WebRTC Calling]
    end
    
    subgraph "Staff & Operations"
        M[HR Dashboard<br/>Attendance & QR]
        N[Case Management<br/>Ticket System]
        O[Content Management<br/>FAQs & Guidelines]
    end
    
    A --> D
    D --> F
    B --> E
    E --> I
    C --> I
    F --> G
    G --> H
    I --> G
    J --> G
    K --> G
    L --> F
    M --> G
    N --> G
    O --> G
    
    style A fill:#e1f5ff
    style F fill:#ffe1f5
    style G fill:#f5ffe1
    style J fill:#fff5e1
```

### Component Architecture

```mermaid
graph LR
    subgraph "Frontend Layer"
        A1[Next.js 13<br/>React App]
        A2[TailwindCSS<br/>Modern UI]
        A3[WebRTC Client<br/>Browser Calling]
    end
    
    subgraph "Backend Layer"
        B1[NestJS API<br/>RESTful Services]
        B2[TypeORM<br/>Database ORM]
        B3[JWT Auth<br/>Security]
    end
    
    subgraph "Communication Layer"
        C1[Asterisk PBX<br/>SIP/WebRTC]
        C2[WebSocket<br/>Real-time Events]
        C3[AI API<br/>DeepSeek]
    end
    
    subgraph "Data Layer"
        D1[PostgreSQL<br/>Production DB]
        D2[SQLite<br/>Development]
        D3[File Storage<br/>Recordings & QR]
    end
    
    A1 --> B1
    A2 --> A1
    A3 --> C1
    B1 --> B2
    B1 --> B3
    B1 --> C1
    B1 --> C2
    B1 --> C3
    B2 --> D1
    B2 --> D2
    C1 --> D3
    
    style A1 fill:#4a90e2
    style B1 fill:#50c878
    style C1 fill:#ff6b6b
    style D1 fill:#f39c12
```

---

## 🔄 How It Works

### Call Flow Architecture

```mermaid
flowchart TD
    Start([Citizen Dials<br/>Toll-Free 117]) --> Check{Business<br/>Hours?}
    
    Check -->|Yes| IVR[IVR Menu<br/>Press 1-4 for Options]
    Check -->|No| VM[Voicemail<br/>Leave Message]
    
    IVR --> Route{Route<br/>Based On}
    
    Route -->|Option 1| Q1[Exam Malpractice<br/>Queue]
    Route -->|Option 2| Q2[Teacher Complaints<br/>Queue]
    Route -->|Option 3| Q3[School Facilities<br/>Queue]
    Route -->|Option 4| Q4[General Inquiry<br/>Queue]
    
    Q1 --> Agent{Available<br/>Agent?}
    Q2 --> Agent
    Q3 --> Agent
    Q4 --> Agent
    
    Agent -->|Yes| Connect[Connect to Agent<br/>WebRTC Call]
    Agent -->|No| Queue[Queue Position<br/>Play Hold Music]
    
    Queue --> Wait[Wait for Next<br/>Available Agent]
    Wait --> Connect
    
    Connect --> Case[Create Case<br/>Link Recording]
    Case --> Resolve[Agent Resolves<br/>Issue]
    Resolve --> End([Call Ends<br/>Case Saved])
    
    VM --> Email[Email to<br/>Supervisor]
    Email --> End
    
    style Start fill:#4a90e2
    style Connect fill:#50c878
    style Case fill:#f39c12
    style End fill:#e74c3c
```

### User Role Flow

```mermaid
flowchart LR
    subgraph "Citizen Journey"
        C1[Call Toll-Free] --> C2[Navigate IVR]
        C2 --> C3[Speak to Agent]
        C3 --> C4[Issue Resolved]
        
        C5[Visit Website] --> C6[Chat with AI]
        C6 --> C7[Get Information]
        
        C8[Check FAQ] --> C9[Self-Service]
    end
    
    subgraph "Agent Workflow"
        A1[Login Dashboard] --> A2[Set Status: Ready]
        A2 --> A3[Receive Incoming Call]
        A3 --> A4[Create Case]
        A4 --> A5[Document Issue]
        A5 --> A6[Resolve & Close]
        A6 --> A2
    end
    
    subgraph "Supervisor Tasks"
        S1[Monitor Dashboard] --> S2[View Analytics]
        S2 --> S3[Check Agent Performance]
        S3 --> S4[Review Cases]
        S4 --> S5[Assign Complex Cases]
        S5 --> S6[Generate Reports]
    end
    
    subgraph "Admin Operations"
        AD1[Configure Routing] --> AD2[Manage Staff]
        AD2 --> AD3[Set Schedules]
        AD3 --> AD4[Update IVR]
        AD4 --> AD5[Monitor System]
        AD5 --> AD6[Export Data]
    end
    
    C4 -.Feedback.-> S1
    A6 -.Case Update.-> S4
    S5 -.Escalation.-> A3
    AD4 -.IVR Update.-> C2
    
    style C4 fill:#50c878
    style A6 fill:#4a90e2
    style S6 fill:#f39c12
    style AD6 fill:#e74c3c
```

---

## 🌟 Key Features

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

---

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
