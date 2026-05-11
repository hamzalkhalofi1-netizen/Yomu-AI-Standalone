export const FEATURED = [
  {
    id: 'f1',
    title: 'Demon Slayer',
    cover: 'https://cdn.myanimelist.net/images/manga/3/179023l.jpg',
    genre: 'Action • Aventure',
    rating: 9.2,
    status: 'En cours',
    description:
      'Tanjiro Kamado, un jeune garçon au cœur pur, part en quête pour sauver sa sœur transformée en démon et venger sa famille massacrée.',
  },
  {
    id: 'f2',
    title: 'One Piece',
    cover: 'https://cdn.myanimelist.net/images/manga/2/253146l.jpg',
    genre: 'Action • Fantasy',
    rating: 9.5,
    status: 'En cours',
    description:
      "Monkey D. Luffy explore un monde fantastique à la recherche du trésor légendaire One Piece pour devenir le Roi des Pirates.",
  },
  {
    id: 'f3',
    title: 'Attack on Titan',
    cover: 'https://cdn.myanimelist.net/images/manga/2/37846l.jpg',
    genre: 'Action • Drame',
    rating: 9.0,
    status: 'Terminé',
    description:
      "Dans un monde où l'humanité vit derrière de grandes murailles pour se protéger des Titans, Eren Yeager jure de les exterminer tous.",
  },
];

export const TRENDING = [
  {
    id: 't1',
    title: 'Jujutsu Kaisen',
    cover: 'https://cdn.myanimelist.net/images/manga/3/210341l.jpg',
    genre: 'Action',
    rating: 8.7,
    chapters: 262,
    status: 'En cours',
    views: '12.4M',
  },
  {
    id: 't2',
    title: 'My Hero Academia',
    cover: 'https://cdn.myanimelist.net/images/manga/1/209370l.jpg',
    genre: 'Super-héros',
    rating: 8.1,
    chapters: 420,
    status: 'Terminé',
    views: '9.8M',
  },
  {
    id: 't3',
    title: 'Chainsaw Man',
    cover: 'https://cdn.myanimelist.net/images/manga/3/216464l.jpg',
    genre: 'Action • Horreur',
    rating: 8.9,
    chapters: 167,
    status: 'En cours',
    views: '11.1M',
  },
  {
    id: 't4',
    title: 'Spy x Family',
    cover: 'https://cdn.myanimelist.net/images/manga/2/253847l.jpg',
    genre: 'Comédie',
    rating: 8.5,
    chapters: 98,
    status: 'En cours',
    views: '7.3M',
  },
  {
    id: 't5',
    title: 'Tokyo Revengers',
    cover: 'https://cdn.myanimelist.net/images/manga/3/258224l.jpg',
    genre: 'Action • Drame',
    rating: 7.9,
    chapters: 278,
    status: 'Terminé',
    views: '6.9M',
  },
  {
    id: 't6',
    title: 'Bleach',
    cover: 'https://cdn.myanimelist.net/images/manga/3/117819l.jpg',
    genre: 'Action • Fantasy',
    rating: 8.2,
    chapters: 686,
    status: 'Terminé',
    views: '8.5M',
  },
];

export const RECENT_UPDATES = [
  { id: 'r1', title: 'Demon Slayer', chapter: 'Ch. 205', time: 'Il y a 2h', cover: 'https://cdn.myanimelist.net/images/manga/3/179023l.jpg' },
  { id: 'r2', title: 'One Piece', chapter: 'Ch. 1108', time: 'Il y a 5h', cover: 'https://cdn.myanimelist.net/images/manga/2/253146l.jpg' },
  { id: 'r3', title: 'Jujutsu Kaisen', chapter: 'Ch. 262', time: 'Il y a 1j', cover: 'https://cdn.myanimelist.net/images/manga/3/210341l.jpg' },
  { id: 'r4', title: 'Chainsaw Man', chapter: 'Ch. 167', time: 'Il y a 2j', cover: 'https://cdn.myanimelist.net/images/manga/3/216464l.jpg' },
];

export const CHAPTERS = Array.from({ length: 30 }, (_, i) => ({
  id: `ch${30 - i}`,
  number: 30 - i,
  title: `Chapitre ${30 - i}`,
  date: `${i + 1} Mai 2024`,
  pages: Math.floor(Math.random() * 20) + 15,
}));

export const USER_PROFILE = {
  name: 'Hamza L.',
  username: '@hamzalkhalofi1',
  avatar: null,
  mangaRead: 142,
  chaptersRead: 3847,
  following: 24,
  favorites: [
    { id: 't1', title: 'Jujutsu Kaisen', cover: 'https://cdn.myanimelist.net/images/manga/3/210341l.jpg', progress: '262/262' },
    { id: 't3', title: 'Chainsaw Man', cover: 'https://cdn.myanimelist.net/images/manga/3/216464l.jpg', progress: '120/167' },
    { id: 't4', title: 'Spy x Family', cover: 'https://cdn.myanimelist.net/images/manga/2/253847l.jpg', progress: '45/98' },
  ],
};
