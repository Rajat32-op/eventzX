export const mockMeetups = [
  {
    id: "1",
    title: "Morning Meditation Session",
    description: "Start your day with peace. 30-minute guided meditation at the campus garden. All levels welcome!",
    time: "Tomorrow, 6:00 AM",
    location: "Campus Garden, Gate 2",
    category: "Meditation",
    host: {
      name: "Arjun Sharma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
      college: "IIT Hyderabad"
    },
    attendees: 8,
    maxAttendees: 15
  },
  {
    id: "2", 
    title: "Chilkur Temple Visit",
    description: "Weekend trip to Chilkur Balaji Temple. Transport arranged. Let's seek blessings together! 🙏",
    time: "Sunday, 5:00 PM",
    location: "Meeting at Main Gate",
    category: "Temple Visit",
    host: {
      name: "Priya Patel",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      college: "IIT Hyderabad"
    },
    attendees: 12,
    maxAttendees: 20
  },
  {
    id: "3",
    title: "Gita Discussion Circle",
    description: "Weekly verse-by-verse reading of Bhagavad Gita. This week: Chapter 2 - Sankhya Yoga. No prior knowledge needed.",
    time: "Friday, 7:00 PM",
    location: "Library Hall B",
    category: "Bhagavad Gita",
    host: {
      name: "Rahul Menon",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
      college: "IIT Hyderabad"
    },
    attendees: 6
  },
  {
    id: "4",
    title: "Sunrise Yoga on the Terrace",
    description: "Hatha yoga session as the sun rises. Bring your own mat. Chai provided after! ☕",
    time: "Daily, 5:30 AM",
    location: "Hostel H4 Terrace",
    category: "Yoga",
    host: {
      name: "Sneha Reddy",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
      college: "IIT Hyderabad"
    },
    attendees: 15,
    maxAttendees: 20
  },
  {
    id: "5",
    title: "Evening Walk & Spiritual Talk",
    description: "30-min walk around campus followed by casual discussion about life, purpose, and spirituality.",
    time: "Today, 6:30 PM",
    location: "Sports Ground",
    category: "Nature Walk",
    host: {
      name: "Vikram Singh",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
      college: "IIT Hyderabad"
    },
    attendees: 4
  },
  {
    id: "6",
    title: "Kirtan Night",
    description: "Evening of devotional music and chanting. Instruments welcome! Food prasad will be served.",
    time: "Saturday, 8:00 PM",
    location: "Student Activity Center",
    category: "Bhakti",
    host: {
      name: "Aisha Khan",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha",
      college: "IIT Hyderabad"
    },
    attendees: 25,
    maxAttendees: 50
  }
];

export const mockProducts = [
  {
    id: "1",
    name: "Krishna Playing Flute - Minimalist Art Poster",
    price: 299,
    originalPrice: 499,
    image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=400&h=400&fit=crop",
    category: "Posters",
    isNew: true
  },
  {
    id: "2",
    name: '"Be Present" - Premium Cotton Tee',
    price: 599,
    originalPrice: 799,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    category: "T-Shirts",
    isNew: false
  },
  {
    id: "3",
    name: "Pocket Bhagavad Gita - Hindi/English",
    price: 149,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    category: "Books",
    isNew: false
  },
  {
    id: "4",
    name: "Buddha Silhouette - Gradient Poster",
    price: 349,
    originalPrice: 499,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    category: "Posters",
    isNew: true
  },
  {
    id: "5",
    name: '"Inner Peace" - Oversized Hoodie',
    price: 999,
    originalPrice: 1299,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
    category: "T-Shirts",
    isNew: false
  },
  {
    id: "6",
    name: "Zen Quotes Collection - Pocket Book",
    price: 199,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop",
    category: "Books",
    isNew: true
  },
  {
    id: "7",
    name: "Shiva Third Eye - Neon Art Print",
    price: 399,
    originalPrice: 599,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop",
    category: "Posters",
    isNew: false
  },
  {
    id: "8",
    name: "Ganesh Modern Art - A3 Poster",
    price: 279,
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop",
    category: "Posters",
    isNew: false
  }
];

export const mockUser = {
  id: "1",
  name: "Aryan Gupta",
  email: "aryan.gupta@iith.ac.in",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan",
  college: "IIT Hyderabad",
  city: "Hyderabad",
  bio: "3rd year CSE | Exploring the intersection of technology and spirituality. Meditation practitioner for 2 years. Looking to connect with like-minded souls. 🙏",
  interests: ["Meditation", "Bhagavad Gita", "Yoga", "Morning Walks", "Mindfulness"],
  meetupsCreated: 5,
  meetupsJoined: 12,
  joinedDate: "August 2024"
};
