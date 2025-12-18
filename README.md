# EventzX

A modern event discovery and community platform for college students and city communities in India. Create, discover, and join events happening around you.

## Features

### 🎉 Events
- **Create Events** - Post hackathons, competitions, meetups, workshops, and more
- **Multi-Scope Visibility** - Show events at Campus, City, or National level
- **Event Categories** - Hackathons, Sports, Cultural, Study Groups, Clubs, Travel, Volunteering, Wellness, Workshops
- **Registration Links** - Add external Google Form or event page links
- **Join/Leave Events** - Track attendees with optional capacity limits

### 👥 Circles (Communities)
- **Campus Circles** - Connect with your college community
- **City Circles** - Join city-wide communities
- **National Circles** - Pan-India communities visible to everyone
- **Group Chat** - Real-time messaging within circles

### 💬 Chat & Messaging
- **Direct Messages** - Chat with connections
- **Community Chat** - Group messaging in circles
- **Real-time Updates** - Instant message delivery

### 🔔 Notifications
- Event join notifications
- Friend request alerts
- Unread message counts

### 👤 User Profiles
- **Student Flow** - College-based onboarding with auto city detection
- **Non-Student Flow** - City-based community access
- **Friend Connections** - Send/accept friend requests
- **Profile Customization** - Avatar upload, bio, interests

### 🎨 UI/UX
- **Dark/Light Theme** - Toggle between themes
- **Responsive Design** - Mobile-first approach
- **Modern UI** - Glassmorphism effects, smooth animations

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| **State Management** | React Query, React Context |
| **Email** | Brevo SMTP API |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # AppLayout, BottomNav
│   └── ui/             # shadcn/ui components
├── contexts/           # AuthContext, ThemeContext, UnreadCountContext
├── hooks/              # Custom hooks (useEvents, useCommunities, useMessages, etc.)
├── pages/              # Route pages
│   ├── Auth.tsx        # Sign in/Sign up with OTP verification
│   ├── Index.tsx       # Home feed (Campus/City/National tabs)
│   ├── Communities.tsx # Circles listing
│   ├── CreateMeetup.tsx# Create new event
│   ├── Chat.tsx        # Messages list
│   ├── ChatRoom.tsx    # Individual chat room
│   ├── Profile.tsx     # User profile & settings
│   └── ...
├── lib/                # Utilities (cities, colleges, passwordReset)
├── data/               # Static data (colleges list)
└── integrations/       # Supabase client & types

supabase/
├── functions/          # Edge Functions
│   ├── send-otp-email/ # OTP email for signup & password reset
│   └── reset-password/ # Password update with admin privileges
├── migrations/         # Database migrations
└── config.toml         # Supabase config
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or bun
- Supabase account

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd eventzx

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

1. Create a Supabase project
2. Run migrations: `npx supabase db push`
3. Deploy edge functions: `npx supabase functions deploy`
4. Set edge function secrets:
   - `BREVO_API_KEY` - For email sending
   - `SMTP_FROM_EMAIL` - Sender email address
   - `SMTP_FROM_NAME` - Sender name (EventzX)

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Database Tables

- `profiles` - User profiles with college, city, interests
- `events` - Event listings with scope visibility
- `event_attendees` - Event membership
- `communities` - Circles (Campus/City/National)
- `community_members` - Circle membership
- `messages` - Chat messages
- `friend_requests` - Connection requests
- `notifications` - User notifications
- `colleges` - College directory
- `cities` - City directory
- `otp_codes` - Email verification codes
- `password_reset_otps` - Password reset codes

## Deployment

Deployed on Vercel with Supabase backend.

```bash
npm run build
# Deploy to Vercel
```

## License

MIT
