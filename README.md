BAYANIHAN MOBILE APP

License: MIT
Node.js: 18+
React Native: 0.71+

DESCRIPTION:
A React Native mobile app with Node.js backend for managing savings and other functionalities.

FEATURES:
- Feed Social Reels like FB and Tiktok style
- Market place
- Events
- Coop
  - Members
  - Add Manage Savings
  - Loans
  - Performance
  - Announcements
  - Events(coop)
  - Government
  - Add and manage savings
And More features need to code soon.

- User authentication
- Backend API with Socket support
- Responsive UI

PROJECT STRUCTURE:

bayanihan-mobile-app/

├── backend/          # Node.js backend
├── frontend/         # React Native frontend
├── .gitignore        # Files ignored by Git
├── README.md         # Project overview

QUICK START:

MOBILE APP (mobile):

1. Navigate to frontend folder:
   cd mobile

2. Install dependencies:
   npm install

3. Start the mobile app with Expo:
   npx expo start

   > Scan the QR code with your Expo Go app on your mobile device or run in an emulator.

BACKEND (Node.js):

1. Navigate to backend folder:
   cd backend

2. Install dependencies:
   npm install

3. Run the backend server:
   npm run dev

   > This will start both socket.ts and index.ts (make sure your dev script in package.json runs both). Ensure .env is properly configured.

NOTES:

- node_modules/ and uploaded media files are NOT included in the repo.
- Large files should be hosted externally (e.g., AWS S3, Firebase Storage).
- Recommended Node.js version: 18+.
- Ensure .env files are created locally for environment variables.
- Screenshots can be saved in a separate folder for reference.

LICENSE:
MIT License
