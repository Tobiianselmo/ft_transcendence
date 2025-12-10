# ft_transcendence

## Overview

**ft_transcendence** is a comprehensive web application centered around the classic game of Pong. This project was built as the final capstone for the 42 Common Core curriculum. It features a robust backend, a dynamic frontend, and real-time multiplayer capabilities.

The application allows users to play Pong in various modes (1v1, 2v2, vs AI, Tournament), chat with other users, manage friends, and customize their profiles. It includes secure authentication (including 2FA and Google OAuth) and is fully containerized using Docker.

## Features

### 🏓 Game Modes
- **Classic 1v1**: Play against another player in real-time.
- **2v2**: Team up for a doubles match.
- **vs AI**: Challenge an AI opponent.
- **Tournament**: Organize and participate in bracket-style tournaments.
- **Local & Online**: Support for both local multiplayer and online matchmaking.

### 👤 User Management
- **Authentication**: Secure login/signup with JWT.
- **OAuth**: Login with Google.
- **Two-Factor Authentication (2FA)**: Enhanced security using Google Authenticator or email codes.
- **Profile**: Customizable user profiles with avatars and stats.
- **Friends System**: Add, remove, and block users. View online status.

### 💬 Social
- **Real-time Chat**: Global and private messaging.
- **Direct Messages**: Chat one-on-one with friends.
- **Game Invites**: Challenge friends directly from the chat or profile.

### 🛠️ Technical Highlights
- **Single Page Application (SPA)**: Built with Vanilla TypeScript for a lightweight and fast frontend.
- **Backend**: Powered by Node.js and Fastify for high performance.
- **Database**: SQLite for reliable data persistence.
- **Real-time Communication**: Socket.IO for game state synchronization and chat.
- **Containerization**: Fully Dockerized with Nginx as a reverse proxy.

## Tech Stack

- **Frontend**: TypeScript, HTML5, CSS3
- **Backend**: Node.js, Fastify, Socket.IO
- **Database**: SQLite
- **DevOps**: Docker, Docker Compose, Nginx, Makefile

## Installation & Running

### Prerequisites
- Docker
- Docker Compose
- Make (optional, for convenience)

### Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/tobiianselmo/ft_transcendence.git
    cd ft_transcendence
    ```

2.  **Build and Run:**
    You can use the provided `Makefile` for easy management.
    ```bash
    make
    ```
    Or using Docker Compose directly:
    ```bash
    docker-compose up --build -d
    ```

3.  **Access the Application:**
    Open your browser and navigate to:
    ```
    https://localhost:8443
    ```
    *(Note: You may need to accept the self-signed certificate warning as this is a development environment)*

### Commands

- `make` or `make all`: Build and start the containers.
- `make build`: Build the Docker images.
- `make stop`: Stop the containers.
- `make clean`: Stop and remove containers/images (preserves database).
- `make fclean`: Stop and remove everything including database volumes.
- `make re`: Rebuild and restart.

## Configuration

The application comes with default configuration for development.
- **Environment Variables**: Sensitive keys (like API secrets) have been removed or set to placeholders. You may need to configure a `.env` file in `backend/config/` for full functionality (e.g., for Google OAuth or real email sending).
- **Ports**:
    - Frontend/Nginx: `8443` (HTTPS), `8080` (HTTP)
    - Backend: `3000`

## License

This project is part of the 42 School curriculum.
