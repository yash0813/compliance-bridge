# Deployment Guide for Compliance-Bridge

This project is configured for easy deployment using Docker. It combines the React frontend and Node.js backend into a single containerized application.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

## 🚀 Quick Start (Production Mode)

To run the entire application (Backend + Frontend + MongoDB) in a production-like environment on your local machine:

1.  Open a terminal in the project root.
2.  Run the following command:

    ```bash
    docker-compose up --build
    ```

3.  The application will start building. Once complete:
    -   **App URL**: [http://localhost:5001](http://localhost:5001)
    -   **Database**: A local MongoDB container is running on port 27017.

### What happens?
-   The frontend is built using `vite build` (optimized production assets).
-   The backend serves the API at `/api/...`.
-   The backend serves the frontend assets for all other routes (`*`).
-   Data is persisted in a Docker volume `mongo-data`.

## 🛠 Manual Deployment (No Docker)

If you prefer to run it manually without Docker:

1.  **Build Frontend**:
    ```bash
    npm install
    npm run build
    ```

2.  **Setup Backend**:
    ```bash
    cd backend
    npm install
    # Ensure local MongoDB is running OR it will fall back to In-Memory DB (data lost on restart)
    ```

3.  **Run Production Server**:
    ```bash
    # From within backend folder
    export NODE_ENV=production
    node server.js
    ```

4.  Access at [http://localhost:5001](http://localhost:5001).

## ☁️ Cloud Deployment (AWS/GCP/Azure)

Since the app is containerized, you can deploy it to any container service:

-   **AWS App Runner / ECS**: Push the image to ECR and deploy.
-   **Google Cloud Run**: Push to GCR and deploy (ensure you provide `MONGODB_URI` env var pointing to Atlas or a managed DB).
-   **Render / Heroku**:
    -   Connect your repo.
    -   Set Build Command: `npm install && npm run build && cd backend && npm install`
    -   Set Start Command: `cd backend && node server.js`
    -   Set Environment Variable `NODE_ENV=production`

## 🐳 Docker Commands Cheatsheet

-   **Start in background**: `docker-compose up -d`
-   **Stop**: `docker-compose down`
-   **View Logs**: `docker-compose logs -f`
-   **Rebuild**: `docker-compose up --build`
