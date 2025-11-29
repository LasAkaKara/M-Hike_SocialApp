export const mockHikes = [
  {
    id: '1',
    name: 'Eagle Peak Trail',
    location: 'Rocky Mountain National Park',
    date: '2024-11-15',
    parking: true,
    length: 12.5,
    difficulty: 7,
    description: 'A challenging hike with breathtaking views at the summit. The trail is steep but well-maintained.',
    image: 'https://images.unsplash.com/photo-1603475429038-44361bcde123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZyUyMHRyYWlsfGVufDF8fHx8MTc2MzY5NDc0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    observations: [
      {
        title: 'Trail Closure',
        time: '10:30 AM',
        comments: 'Upper section temporarily closed due to rockfall. Take alternative route.',
        photo: 'https://images.unsplash.com/photo-1606482397616-80e63ed08111?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHBlYWslMjB2aWV3fGVufDF8fHx8MTc2MzY5NDc0OHww&ixlib=rb-4.1.0&q=80&w=1080',
        location: 'Mile 8.2',
        status: 'Open',
        confirmations: 5,
        disputes: 0
      },
      {
        title: 'Wildlife Sighting',
        time: '2:15 PM',
        comments: 'Saw a family of mountain goats near the summit.',
        location: 'Summit area',
        confirmations: 12,
        disputes: 0
      }
    ]
  },
  {
    id: '2',
    name: 'Whispering Pines Loop',
    location: 'Cascade State Forest',
    date: '2024-11-10',
    parking: true,
    length: 8.3,
    difficulty: 4,
    description: 'Peaceful forest trail with gentle elevation gain. Perfect for a morning hike.',
    image: 'https://images.unsplash.com/photo-1625749670846-8d5629e85a01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjB0cmFpbCUyMG5hdHVyZXxlbnwxfHx8fDE3NjM2NTI3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    observations: []
  },
  {
    id: '3',
    name: 'Sunset Ridge',
    location: 'Blue Mountain Wilderness',
    date: '2024-11-05',
    parking: false,
    length: 15.2,
    difficulty: 8,
    description: 'Strenuous hike with incredible sunset views. Best done in late afternoon.',
    image: 'https://images.unsplash.com/photo-1606482397616-80e63ed08111?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHBlYWslMjB2aWV3fGVufDF8fHx8MTc2MzY5NDc0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    observations: [
      {
        title: 'Amazing Views',
        time: '6:45 PM',
        comments: 'Caught the most beautiful sunset from the ridge.',
        photo: 'https://images.unsplash.com/photo-1606482397616-80e63ed08111?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHBlYWslMjB2aWV3fGVufDF8fHx8MTc2MzY5NDc0OHww&ixlib=rb-4.1.0&q=80&w=1080',
        location: 'Ridge viewpoint',
        confirmations: 8,
        disputes: 0
      }
    ]
  },
  {
    id: '4',
    name: 'Crystal Falls Trail',
    location: 'Green Valley Park',
    date: '2024-10-28',
    parking: true,
    length: 5.8,
    difficulty: 3,
    description: 'Easy family-friendly trail leading to a beautiful waterfall.',
    image: 'https://images.unsplash.com/photo-1696610101250-f5933d2f616c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcmZhbGwlMjBoaWtpbmd8ZW58MXx8fHwxNzYzNjk0NzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    observations: []
  }
];

export const mockObservations = [
  {
    id: 'obs1',
    userName: 'Sarah Johnson',
    timeAgo: '2 hours ago',
    distance: '2.3 km away',
    title: 'Trail Washout Alert',
    comments: 'Heavy rains have washed out a section of the trail near mile marker 5. Use caution or take the bypass route.',
    photo: 'https://images.unsplash.com/photo-1603475429038-44361bcde123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZyUyMHRyYWlsfGVufDF8fHx8MTc2MzY5NDc0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Maple Ridge Trail, Mile 5',
    status: 'Open',
    confirmations: 15,
    disputes: 2
  },
  {
    id: 'obs2',
    userName: 'Mike Chen',
    timeAgo: '5 hours ago',
    distance: '1.8 km away',
    title: 'Bear Activity',
    comments: 'Spotted fresh bear tracks on the north section. Stay alert and make noise.',
    photo: 'https://images.unsplash.com/photo-1625749670846-8d5629e85a01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjB0cmFpbCUyMG5hdHVyZXxlbnwxfHx8fDE3NjM2NTI3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Pine Forest Loop, North Trail',
    status: 'Open',
    confirmations: 8,
    disputes: 0
  },
  {
    id: 'obs3',
    userName: 'Emma Davis',
    timeAgo: '1 day ago',
    distance: '4.1 km away',
    title: 'Beautiful Wildflowers',
    comments: 'The meadow is in full bloom right now! Best time to visit for photography.',
    photo: 'https://images.unsplash.com/photo-1606482397616-80e63ed08111?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHBlYWslMjB2aWV3fGVufDF8fHx8MTc2MzY5NDc0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Alpine Meadow Trail',
    confirmations: 23,
    disputes: 0
  }
];

export const mockSocialHikes = [
  {
    id: 'social1',
    userName: 'Alex Thompson',
    timeAgo: '3 hours ago',
    name: 'Mount Jefferson Summit',
    location: 'Jefferson Wilderness Area',
    date: '2024-11-20',
    length: 18.5,
    difficulty: 9,
    description: 'Conquered this beast today! The views from the top were absolutely worth every step. Challenging but incredible experience.',
    image: 'https://images.unsplash.com/photo-1603475429038-44361bcde123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZyUyMHRyYWlsfGVufDF8fHx8MTc2MzY5NDc0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 45,
    comments: 12
  },
  {
    id: 'social2',
    userName: 'Lisa Martinez',
    timeAgo: '1 day ago',
    name: 'Riverside Walk',
    location: 'Cedar Creek Valley',
    date: '2024-11-19',
    length: 6.2,
    difficulty: 2,
    description: 'Perfect morning walk along the river. So peaceful and refreshing!',
    image: 'https://images.unsplash.com/photo-1625749670846-8d5629e85a01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjB0cmFpbCUyMG5hdHVyZXxlbnwxfHx8fDE3NjM2NTI3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 32,
    comments: 8
  },
  {
    id: 'social3',
    userName: 'David Kim',
    timeAgo: '2 days ago',
    name: 'Granite Peak Challenge',
    location: 'Sierra Mountain Range',
    date: '2024-11-18',
    length: 22.3,
    difficulty: 10,
    description: 'The hardest hike I\'ve ever done. Started at 4 AM and didn\'t finish until sunset. Absolutely epic!',
    image: 'https://images.unsplash.com/photo-1606482397616-80e63ed08111?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHBlYWslMjB2aWV3fGVufDF8fHx8MTc2MzY5NDc0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 78,
    comments: 25
  }
];
