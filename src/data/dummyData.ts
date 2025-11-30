// Dummy data for demo purposes when database is empty

export const dummyMeetups = [
  {
    id: "demo-1",
    title: "Morning Meditation Session",
    description: "Start your day with peace. 30-minute guided meditation at the campus garden. All levels welcome!",
    date: "2024-12-02",
    time: "06:00",
    location: "Campus Garden, Gate 2",
    category: "Meditation",
    creator_id: "demo-user-1",
    max_attendees: 15,
    creator: {
      id: "demo-user-1",
      name: "Arjun Sharma",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
      college: "IIT Hyderabad"
    },
    attendee_count: 8,
    is_joined: false
  },
  {
    id: "demo-2",
    title: "Chilkur Temple Visit",
    description: "Weekend trip to Chilkur Balaji Temple. Transport arranged. Let's seek blessings together! 🙏",
    date: "2024-12-03",
    time: "17:00",
    location: "Meeting at Main Gate",
    category: "Temple Visit",
    creator_id: "demo-user-2",
    max_attendees: 20,
    creator: {
      id: "demo-user-2",
      name: "Priya Patel",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      college: "IIT Hyderabad"
    },
    attendee_count: 12,
    is_joined: false
  },
  {
    id: "demo-3",
    title: "Gita Discussion Circle",
    description: "Weekly verse-by-verse reading of Bhagavad Gita. This week: Chapter 2 - Sankhya Yoga. No prior knowledge needed.",
    date: "2024-12-01",
    time: "19:00",
    location: "Library Hall B",
    category: "Discussion",
    creator_id: "demo-user-3",
    max_attendees: null,
    creator: {
      id: "demo-user-3",
      name: "Rahul Menon",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
      college: "IIT Hyderabad"
    },
    attendee_count: 6,
    is_joined: false
  },
  {
    id: "demo-4",
    title: "Sunrise Yoga on the Terrace",
    description: "Hatha yoga session as the sun rises. Bring your own mat. Chai provided after! ☕",
    date: "2024-12-01",
    time: "05:30",
    location: "Hostel H4 Terrace",
    category: "Yoga",
    creator_id: "demo-user-4",
    max_attendees: 20,
    creator: {
      id: "demo-user-4",
      name: "Sneha Reddy",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
      college: "IIT Hyderabad"
    },
    attendee_count: 15,
    is_joined: true
  },
  {
    id: "demo-5",
    title: "Evening Walk & Spiritual Talk",
    description: "30-min walk around campus followed by casual discussion about life, purpose, and spirituality.",
    date: "2024-12-01",
    time: "18:30",
    location: "Sports Ground",
    category: "Nature Walk",
    creator_id: "demo-user-5",
    max_attendees: null,
    creator: {
      id: "demo-user-5",
      name: "Vikram Singh",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
      college: "IIT Hyderabad"
    },
    attendee_count: 4,
    is_joined: false
  },
  {
    id: "demo-6",
    title: "Kirtan Night",
    description: "Evening of devotional music and chanting. Instruments welcome! Food prasad will be served.",
    date: "2024-12-07",
    time: "20:00",
    location: "Student Activity Center",
    category: "Discussion",
    creator_id: "demo-user-6",
    max_attendees: 50,
    creator: {
      id: "demo-user-6",
      name: "Aisha Khan",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha",
      college: "IIT Hyderabad"
    },
    attendee_count: 25,
    is_joined: false
  }
];

export const dummyCityMeetups = [
  {
    id: "city-1",
    title: "Weekend Yoga at KBR Park",
    description: "Open-air yoga session at KBR Park. All skill levels welcome. Bring your mat!",
    date: "2024-12-08",
    time: "07:00",
    location: "KBR National Park, Gate 3",
    category: "Yoga",
    creator_id: "city-user-1",
    max_attendees: 30,
    creator: {
      id: "city-user-1",
      name: "Sanjay Kulkarni",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanjay",
      college: "Hyderabad Circle"
    },
    attendee_count: 18,
    is_joined: false
  },
  {
    id: "city-2",
    title: "Birla Mandir Evening Darshan",
    description: "Group visit to Birla Mandir. Meeting at Necklace Road metro station. Beautiful sunset views!",
    date: "2024-12-05",
    time: "17:30",
    location: "Necklace Road Metro Station",
    category: "Temple Visit",
    creator_id: "city-user-2",
    max_attendees: 25,
    creator: {
      id: "city-user-2",
      name: "Meera Nair",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
      college: "Hyderabad Circle"
    },
    attendee_count: 15,
    is_joined: true
  },
  {
    id: "city-3",
    title: "Mindfulness Walk at Hussain Sagar",
    description: "Slow, mindful walk around Hussain Sagar lake. Practice being present. Beginners welcome.",
    date: "2024-12-06",
    time: "06:00",
    location: "Tank Bund, Gandhi Statue",
    category: "Nature Walk",
    creator_id: "city-user-3",
    max_attendees: 15,
    creator: {
      id: "city-user-3",
      name: "Aditya Rao",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya",
      college: "Hyderabad Circle"
    },
    attendee_count: 8,
    is_joined: false
  }
];

export const dummyCommunities = [
  {
    id: "comm-1",
    name: "IIT Hyderabad Meditation Club",
    description: "Daily meditation sessions and mindfulness practices for IITH students",
    type: "Campus",
    image_url: null,
    created_by: "demo-user-1",
    member_count: 156,
    is_joined: true
  },
  {
    id: "comm-2",
    name: "Yoga Enthusiasts",
    description: "For those who love yoga! Share tips, join sessions, and grow together",
    type: "Interest",
    image_url: null,
    created_by: "demo-user-4",
    member_count: 89,
    is_joined: false
  },
  {
    id: "comm-3",
    name: "Bhagavad Gita Study Group",
    description: "Weekly discussions on the timeless wisdom of Bhagavad Gita",
    type: "Interest",
    image_url: null,
    created_by: "demo-user-3",
    member_count: 67,
    is_joined: true
  },
  {
    id: "comm-4",
    name: "Morning Walks Squad",
    description: "Early risers who love campus morning walks. Fresh air, fresh mind!",
    type: "Campus",
    image_url: null,
    created_by: "demo-user-5",
    member_count: 45,
    is_joined: false
  },
  {
    id: "comm-5",
    name: "Hyderabad Spiritual Seekers",
    description: "Connect with spiritual enthusiasts across Hyderabad. Temple visits, events & more!",
    type: "City",
    image_url: null,
    created_by: "city-user-1",
    member_count: 1250,
    is_joined: true
  },
  {
    id: "comm-6",
    name: "Hyderabad Yoga Network",
    description: "City-wide yoga community. Find classes, partners, and events across Hyderabad",
    type: "City",
    image_url: null,
    created_by: "city-user-2",
    member_count: 890,
    is_joined: false
  }
];

export const dummyProfiles = [
  {
    id: "profile-1",
    name: "Priya Sharma",
    email: "priya.sharma@iith.ac.in",
    college: "IIT Hyderabad",
    city: "Hyderabad",
    bio: "Final year CSE. Practicing meditation for 3 years. Love morning walks and temple visits. 🙏",
    interests: ["Meditation", "Temple Visit", "Morning Walks", "Yoga"],
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
  },
  {
    id: "profile-2",
    name: "Rahul Menon",
    email: "rahul.menon@iith.ac.in",
    college: "IIT Hyderabad",
    city: "Hyderabad",
    bio: "2nd year EE. Into Bhagavad Gita study and spiritual discussions. Looking for study buddies!",
    interests: ["Bhagavad Gita", "Spiritual discussions", "Meditation"],
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"
  },
  {
    id: "profile-3",
    name: "Sneha Reddy",
    email: "sneha.reddy@iith.ac.in",
    college: "IIT Hyderabad",
    city: "Hyderabad",
    bio: "Yoga instructor & BTech student. Teaching free yoga classes on weekends. Join us! 🧘‍♀️",
    interests: ["Yoga", "Meditation", "Mindfulness", "Nature Walk"],
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha"
  },
  {
    id: "profile-4",
    name: "Arjun Singh",
    email: "arjun.singh@iith.ac.in",
    college: "IIT Hyderabad",
    city: "Hyderabad",
    bio: "3rd year Mech. Weekend temple visits are my thing. Also into kirtan and bhakti music.",
    interests: ["Temple Visit", "Bhakti", "Meditation", "Kirtan"],
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunS"
  },
  {
    id: "profile-5",
    name: "Aisha Khan",
    email: "aisha.khan@iith.ac.in",
    college: "IIT Hyderabad",
    city: "Hyderabad",
    bio: "Finding peace through mindfulness. Love interfaith discussions and learning about different paths.",
    interests: ["Mindfulness", "Spiritual discussions", "Meditation", "Nature Walk"],
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha"
  },
  {
    id: "profile-6",
    name: "Vikram Patel",
    email: "vikram.patel@iith.ac.in",
    college: "IIT Hyderabad",
    city: "Hyderabad",
    bio: "Early morning meditation practitioner. 5 AM club member. Seeking peace in chaos of college life.",
    interests: ["Meditation", "Yoga", "Morning Walks"],
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=VikramP"
  }
];

export const dummyConversations = [
  {
    id: "conv-1",
    name: "Priya Sharma",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    last_message: "See you at the meditation session tomorrow! 🧘‍♀️",
    last_message_time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    unread_count: 2,
    is_community: false
  },
  {
    id: "comm-1",
    name: "IIT Hyderabad Meditation Club",
    avatar_url: null,
    last_message: "Rahul: Don't forget the session is at 6 AM!",
    last_message_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    unread_count: 5,
    is_community: true
  },
  {
    id: "conv-2",
    name: "Rahul Menon",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    last_message: "Chapter 3 discussion was amazing! Let's continue next week.",
    last_message_time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    unread_count: 0,
    is_community: false
  },
  {
    id: "comm-3",
    name: "Bhagavad Gita Study Group",
    avatar_url: null,
    last_message: "Sneha: Who's bringing the notes tomorrow?",
    last_message_time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    unread_count: 3,
    is_community: true
  },
  {
    id: "conv-3",
    name: "Sneha Reddy",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    last_message: "Thanks for joining the yoga class! You did great 💪",
    last_message_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    unread_count: 0,
    is_community: false
  }
];
