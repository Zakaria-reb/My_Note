# GestionNotes - Multi-Platform Notes Application

A modern, feature-rich notes application built with React Native and Expo. Create, edit, search, and manage your notes with an intuitive user interface across iOS, Android, and Web platforms.

## Features

- **User Authentication**: Secure user registration and login with SHA-256 password hashing
- **Create & Edit Notes**: Add new notes with title and content, supporting text and drawing capabilities
- **Search Functionality**: Quickly find notes by title or content
- **Note Management**: View, edit, and delete your notes
- **Drawing Support**: Add sketches and drawings to your notes
- **Cross-Platform**: Works seamlessly on iOS, Android, and Web
- **Local Storage**: All data is stored securely using SQLite database
- **Beautiful UI**: Modern design with intuitive navigation and smooth animations
- **Date Tracking**: Automatically tracks note creation and update timestamps

## Platforms Supported

- **iOS** (iPhone & iPad)
- **Android** (phones and tablets)
- **Web** (browsers)

## Tech Stack

- **Framework**: React Native 0.81.5 with Expo
- **Database**: SQLite (via expo-sqlite)
- **Navigation**: React Navigation (native-stack)
- **State Management**: React Context API
- **Icons**: Expo Vector Icons
- **Authentication**: SHA-256 password hashing with expo-crypto
- **UI Components**: React Native built-in components
- **File Handling**: expo-file-system, expo-sharing

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI installed globally: `npm install -g expo-cli`
- iOS: Xcode (for iOS development on macOS)
- Android: Android Studio (for Android development)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Mini_Projet_Multiplateforme-branchAmina
```

### 2. Install Dependencies

```bash
npm install
```

or if using yarn:

```bash
yarn install
```

### 3. Start the Development Server

```bash
npm start
```

This will start the Expo Metro server and display options for running on different platforms.

## 🏃 Running the Application

### iOS Development

```bash
npm run ios
```

Requires Xcode and an iOS simulator or connected device.

### Android Development

```bash
npm run android
```

Requires Android Studio and an Android emulator or connected device.

### Web Development

```bash
npm run web
```

Opens the app in your default web browser.

### Using Expo Go (All Platforms)

1. Download Expo Go from your device's app store (iOS App Store or Google Play)
2. Run `npm start`
3. Scan the QR code with Expo Go app or your device camera

## Project Structure

```
src/
├── screens/              # Screen components
│   ├── HomeScreen.js    # Notes list & search
│   ├── LoginScreen.js   # User login
│   ├── RegisterScreen.js # User registration
│   ├── NoteFormScreen.js # Create/edit notes
│   └── NoteDetailScreen.js # View note details
├── navigation/          # Navigation configuration
│   └── AppNavigator.js  # Main navigation stack
├── context/             # React Context for state management
│   └── AuthContext.js   # Authentication context
├── database/            # Database operations
│   └── db.js           # SQLite database functions
├── utils/               # Utility functions
│   └── formatDate.js   # Date formatting helpers
└── theme.js            # Colors, typography, and theme constants
```

## Usage Guide

### Creating a Note

1. Tap the **+** (pencil) button in the bottom-right corner
2. Enter a title and content for your note
3. Optionally add drawings using the drawing tools
4. Save your note

### Editing a Note

1. Select a note from the home screen
2. Tap the edit button to modify the content
3. Save your changes

### Searching Notes

1. Use the search bar at the top of the home screen
2. Type keywords to filter notes by title or content
3. Results update in real-time as you type

### Deleting a Note

1. Swipe or tap the trash icon on a note in the list
2. Confirm the deletion when prompted

### Drawing in Notes

1. While creating or editing a note, use the drawing canvas
2. Sketch and add visual elements to your notes
3. The drawing is saved with your note

## Authentication

- **Registration**: Create a new account with username, email, and password
- **Login**: Securely log in with your credentials
- **Password Security**: Passwords are hashed using SHA-256 algorithm
- **Session Management**: Maintained via React Context for seamless user experience

## Data Storage

All data is stored locally on your device using SQLite:

- **Users Table**: Stores user credentials and account information
- **Notes Table**: Stores all notes with title, content, drawing data, and timestamps

Data is never transmitted to external servers and remains completely private.

## Customization

### Theme Colors

Edit `src/theme.js` to customize colors:

```javascript
export const Colors = {
  yellow: '#FFC107',
  background: '#1C1C1E',
  surface: '#2C2C2E',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  // ... more colors
};
```

### Typography

Modify font sizes and styles in `src/theme.js`:

```javascript
export const Typography = {
  largeTitle: { fontSize: 32, fontWeight: 'bold' },
  // ... more typography styles
};
```

## 🐛 Troubleshooting

### App won't start

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Expo cache: `expo start --clear`

### Database errors

- The database is automatically initialized on first run
- Check console logs for specific error messages

### Platform-specific issues

- **iOS**: Ensure Xcode is up to date
- **Android**: Verify Android SDK is properly configured
- **Web**: Try clearing browser cache and local storage

## Scripts

```bash
npm start      # Start Expo development server
npm run ios    # Run on iOS simulator
npm run android # Run on Android emulator
npm run web    # Run in web browser
```

## Dependencies

Key dependencies used in this project:

- `react-native` - Core React Native framework
- `expo` - Platform for React Native apps
- `expo-sqlite` - SQLite database support
- `expo-crypto` - Cryptographic functions
- `@react-navigation/native` - Navigation library
- `expo-file-system` - File system operations
- `expo-sharing` - File sharing capabilities
- `@expo/vector-icons` - Icon library

See `package.json` for the complete list of dependencies.

---

**Happy Note-Taking!**
