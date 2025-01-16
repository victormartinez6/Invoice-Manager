# Invoice Management Application

A modern, full-featured invoice management system built with React, TypeScript, and Firebase.

## Features

- Create, edit, and manage invoices
- Download invoices as PDF
- Multi-language support (English, Portuguese, Spanish)
- Firebase authentication and data storage
- Responsive design with Tailwind CSS
- Real-time updates
- API key generation for external integrations

## Tech Stack

- React
- TypeScript
- Firebase (Authentication & Firestore)
- Tailwind CSS
- i18next for internationalization
- jsPDF for PDF generation
- Zustand for state management
- React Router for navigation

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Environment Variables

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT