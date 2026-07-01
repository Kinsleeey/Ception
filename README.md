HMS

A modern hotel management dashboard built with React and Vite from a premium Figma design.

The project simulates a complete hotel management system with dedicated interfaces for Administrators, Receptionists, and Bartenders. It focuses on UI/UX implementation, reusable React components, and responsive desktop-first design.

Features
Admin
Dashboard overview
Room management
Guest database
Bar sales report
Settings page
Reception
Room dashboard
Guest registration
Room reservation
Booking management
Room details
Bar
Bartender dashboard
Product management
Add/Edit drinks
Order details
Modal System

The application includes reusable modal components for actions such as:

Guest Registration
Booking Details
Reservation Details
Guest Details
Room Details
Product Management
Confirmation dialogs

All modals open as overlays while keeping the current page visible in the background.

Tech Stack
React
React Router
Vite
JavaScript (ES6+)
CSS3
Project Structure
src/
├── components/
├── pages/
├── data/
├── App.jsx
├── main.jsx
└── styles.css

The project follows a component-based architecture with reusable UI components and separated mock data.

Getting Started
Prerequisites
Node.js 18 or later
Installation
git clone https://github.com/yourusername/premium-hotel.git

cd premium-hotel

npm install

npm run dev

The development server will start at:

http://localhost:5173

To create a production build:

npm run build
Current Status

This project is currently a frontend implementation of the hotel management system.

Implemented:

Complete UI for all three user roles
Routing
Interactive dashboards
Reusable components
Modal workflows
Mock data

Not yet implemented:

Backend integration
Authentication
Database
API communication
Persistent data storage
Design

The interface was built from a premium Figma design with an emphasis on consistency, reusable components, and modern dashboard aesthetics.

License

This project is intended for educational and portfolio purposes.