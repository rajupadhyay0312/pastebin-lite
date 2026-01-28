# Pastebin Lite

Pastebin Lite is a minimal paste-sharing web application that allows users to create text pastes and share them via unique URLs. Each paste can optionally expire after a given time (TTL) or after a limited number of views.

## Features

- Create a paste via a simple web UI
- Share paste via a unique link
- Optional expiration using:
  - Time-to-live (TTL)
  - Maximum number of views
- Clear error handling for expired or invalid pastes
- Serverless-friendly architecture

## Tech Stack

- Next.js (App Router)
- TypeScript
- Upstash Redis (serverless persistence)
- Deployed on Vercel

## Persistence Layer

This project uses **Upstash Redis** as the persistence layer.

Redis was chosen because:
- It is serverless-friendly
- Supports TTL natively
- Works well with stateless serverless functions
- Avoids global in-memory state

Each paste is stored as a Redis key with:
- Content
- Creation timestamp
- Optional expiration time
- View count and optional max views

## Running the Project Locally

### Prerequisites
- Node.js 18+
- An Upstash Redis database

### Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd pastebin-lite

2. Install dependencies 
    npm install

3. Create environment variables   

UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token


4. Build the application 
    npm run build 

5. Start the production server  
   npm start

6. Open the app in your browser 
    http://localhost:3000

