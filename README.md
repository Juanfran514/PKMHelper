# ⚡ PKMHelper (OUTDATED)

> Automated competitive telemetry, live battle tracking bot, and meta analytics engine for Pokémon Showdown.

> Made for Scarlet and Violet meta, doesn't work on Pkm Champions

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-init.sql-4169E1?style=flat-square&logo=postgresql&logoColor=white)](#)
[![WebSockets](https://img.shields.io/badge/WebSockets-Live_Streaming-010101?style=flat-square)](#)

---

## 📌 Overview

**PKMHelper** is a distributed platform designed to automate competitive intelligence for Pokémon Showdown battles. 

Instead of manual note-taking or relying on post-match memory, the system uses an autonomous bot to tap directly into live battle streams, extract turn-by-turn game states, normalize matchup data, and feed a real-time analytics dashboard.

---

## 🏗️ Architecture & Core Components

The repository is organized into distinct decoupled micro-services:

```
PKMHelper/
├── bot/        # Autonomous client listening to live Showdown WebSocket streams
├── backend/    # REST API handling auth, user teams, and telemetry history
├── frontend/   # Interactive dashboard for match reviews and meta breakdown
└── scripts/    # Data scrapers, database seeders, and archetype sorters
```

* **Autonomous Tracking Bot (`/bot`):**
  * `showdownClient.js`: Connects directly to Pokémon Showdown servers via raw WebSockets.
  * `battleScanner.js` & `battleTracker.js`: Watches designated rooms and monitors live active matches.
  * `battleParser.js`: Real-time log parser extracting revealed moves, abilities, items, and team archetypes.
  * `battleSaver.js`: Normalizes match payloads and streams structured events into the database.

* **Data Scraping & Seeding Pipeline (`/scripts`):**
  * `teamScrap.js` & `setsScraper.js`: Automated scrapers extracting current competitive sets and meta teams.
  * `archetypeSorter.js`: Algorithmic sorting script categorizing teams by competitive strategy (Hyper Offense, Balance, Stall, etc.).
  * `pokedexSeed.js`: Ingestion pipeline populating the relational schema (`init.sql`) with baseline battle mechanics data.

* **Full-Stack Application (`/backend` & `/frontend`):**
  * User authentication with password recovery.
  * Team performance tracking across versions and historical win/loss ratios against specific archetypes.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js (ES Modules / CommonJS)
* **Real-Time Ingestion:** WebSockets, Event-driven architecture
* **Database & Persistence:** PostgreSQL, SQL schema migrations (`init.sql`)
* **Scraping & Automation:** Headless crawlers, custom log parsers
* **Infrastructure:** Docker, Docker Compose, 

---

## 🚀 Deployment & Local Setup

The entire multi-container environment (Database, Backend, Bot, and UI) is managed via Docker Compose.

### 1. Clone the repository
```bash
git clone [https://github.com/Juanfran514/PKMHelper.git](https://github.com/Juanfran514/PKMHelper.git)
cd PKMHelper
```

### 2. Configure environment variables
Copy the example environment file and configure your credentials:
```bash
cp .env.example .env
```
Ensure database keys, Mailjet credentials, and bot configurations are properly set.

### 3. Spin up services via Docker
```bash
docker compose up -d --build
```

### 4. Running scrapers and database seeds manually
To run the automated data ingestion pipeline:
```bash
cd scripts
npm install
node pokedexSeed.js
node setsScraper.js
node archetypeSorter.js
```

---

## 👤 Author

Developed by **Juan Francisco**  
*Process Automation, Custom Tooling & Backend Architecture*

- **Email:** [escobosabrocaljuanfran@gmail.com](mailto:escobosabrocaljuanfran@gmail.com)
- **GitHub:** [@Juanfran514](https://github.com/Juanfran514)
