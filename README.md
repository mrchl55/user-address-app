# User Address Management Application

A NextJS application for managing users and their addresses. This application demonstrates modern web development practices including server actions, TypeScript, and responsive UI design with Material UI.

## Features

- User management (create, read, update, delete)
- Address management for users (create, read, update, delete)
- Real-time address preview when creating/editing addresses
- Form validation with error handling
- Responsive UI built with Material UI components
- Server-side data handling with NextJS Server Actions

## Tech Stack

- **Frontend**: NextJS, React, Material UI
- **Backend**: NextJS Server Actions
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Containerization**: Docker
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Running the Application

1. Clone the repository

2. Start the application using Docker Compose:

   ```bash
   docker compose up
   ```

3. The application will be available at http://localhost:3000

4. The database will be initialized with sample data automatically

## Usage

- **View Users**: The main page displays a list of users
- **Create User**: Click "Add New User" to create a new user
- **Edit/Delete User**: Use the context menu in the user row
- **View Addresses**: Click on a user to view their addresses
- **Create Address**: Click "Add New Address" when viewing a user's addresses
- **Edit/Delete Address**: Use the context menu in the address row

## Project Structure

```
users-app/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── actions/          # Server Actions
│   │   ├── components/       # React components
│   │   ├── constants/        # Application constants
│   │   └── page.tsx          # Main page component
│   ├── lib/                  # Utility functions and libraries
│   └── prisma/               # Prisma schema and migrations
├── public/                   # Static assets
├── Dockerfile                # Production Docker configuration
└── package.json              # Project dependencies and scripts
```

## Production Deployment

1. Build the production Docker image:

   ```bash
   docker-compose up -d --build
   ```

2. Run the container:

   ```bash
   docker run -p 3000:3000 -e DATABASE_URL=your_production_db_url user-address-app
   ```

3. Worst case scenario: uncomment ignoreBuildErrors and ignoreDuringBuilds in next.config.ts :D

## License

This project is licensed under the MIT License.
