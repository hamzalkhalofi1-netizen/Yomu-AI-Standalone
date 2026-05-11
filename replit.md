# Yomu AI - Manga Reader App

A React Native / Expo manga reader application with a dark-themed UI for discovering, searching, and reading manga.

## Tech Stack
- React Native 0.73 + Expo SDK 50
- React Navigation (bottom tabs + native stack)
- react-native-web for browser preview
- Mock data with scraper utility for live manga sources

## Project Structure
- `App.js` — entry point and navigation setup
- `src/screens/` — main app screens (Home, Search, Library, Profile, Detail, Settings)
- `src/components/` — reusable UI components (FeaturedSlider, MangaCard)
- `src/data/mockData.js` — static manga data for development
- `src/utils/scraper.js` — manga scraper utility

## Running
The app runs via Expo on port 5000. Use `npm run web` or the workflow.

## User Preferences
- Language: French UI (Bonjour, Accueil, Recherche, Bibliothèque, Profil)
- Dark theme with accent color #e94560
