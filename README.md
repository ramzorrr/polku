# Polku Web

Polku Web is a web application built with React and Vite. This project is designed to help users track their goals and performance over specific periods.

## Features

- Track daily performance and goals
- View performance averages and required averages to meet goals
- Interactive calendar to add, edit and delete performance data
- Responsive design for mobile and desktop

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   sh
   git clone https://github.com/ramzorrr/polkuweb.git
   cd polkuweb
   
   
2. Install dependencies
   npm install
   # or
   yarn install

Running the Development Server
To start the development server, run:
npm run dev
# or
yarn dev

The application will be available at http://localhost:5173/.

Accessing the Server on Other Devices
To access the development server on other devices within the same network, ensure your vite.config.ts is configured to listen on all network interfaces:

// vite.config.ts
```import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})

Then, you can access the server using your local IP address, e.g., http://192.168.100.15:5173/.

Building for Production
To create a production build, run:

The build output will be in the dist directory.

Deployment
You can deploy the contents of the dist directory to any static hosting service, such as Vercel, Netlify, or GitHub Pages.

Usage
Setting a Goal
Use the slider to set your goal.
Click "Aseta Tavoite" to save the goal.
Adding Performance Data
Select a date on the calendar.
Click "Lisää suorite" and enter the performance data for the selected date.
Deleting Performance Data
Select a date on the calendar.
Click "Poista suorite" to delete the performance data for the selected date.
Contributing
Contributions are welcome! Please open an issue or submit a pull request for any changes.

License


This project is licensed under the MIT License. See the LICENSE file for details.


This README should give users a good starting point for understanding and working with your project.


