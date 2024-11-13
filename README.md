
# Event Management System

The Plexus Club Events project is a comprehensive event management system designed for the Plexus Club website. This full-stack application allows for efficient creation, management, and user registration for various events. Built with Node.js and Express on the backend 
. It uses a JSON file as a database to store events and registrations.

## Features

- Create, read, update, and delete events
- Register for events
- User authentication for admin functions
- Export registrations as CSV

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/event-management-system.git
   cd event-management-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:
   ```
   PORT=3000
   JWT_SECRET=your_jwt_secret_here
   ```

4. Initialize the database by creating a `data.json` file in the root directory with the following structure:
   ```json
   {
     "events": [],
     "registrations": [],
     "users": []
   }
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```

2. The server will start running on `http://localhost:3000`

3. Use the API endpoints to interact with the system

## API Endpoints

### Events
```
- GET /api/events - Get all events
- POST /api/events - Create a new event (requires authentication)
- PUT /api/events/:id - Update an event (requires authentication)
- DELETE /api/events/:id - Delete an event (requires authentication)
```
### Registrations
```
- GET /api/registrations?event_id=:eventId - Get all registrations for an event (requires authentication)
- POST /api/registrations - Create a new registration
- PUT /api/registrations/:id - Update a registration (requires authentication)
- DELETE /api/registrations/:id - Delete a registration (requires authentication)
- GET /api/registrations/export/csv?event_id=:eventId - Export registrations as CSV (requires authentication)
```
### Authentication
```
- POST /api/auth/login - Login and receive a JWT token
```
## File Structure

- `server.js` - Main application file
- `routes/` - API route handlers
- `middleware/` - Custom middleware (e.g., authentication)
- `config/` - Configuration files (e.g., database.js)
- `public/` - Static files (HTML, CSS, client-side JS)
- `data.json` - JSON file used as a database

