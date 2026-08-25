# FundiLink

**Kenya's fastest way to find casual work, nearby.**

A web platform that connects people who need short-term skilled work done — plumbing, cleaning, electrical, and more — with verified local workers ("fundis"), matched by location. Built to replace the informal, unreliable process of finding casual labour through WhatsApp groups and word of mouth.



## Problem Statement

### General Project Description
In Kenya, finding a casual worker — a plumber, cleaner, electrician, or similar — is still largely done through WhatsApp groups, personal referrals, and informal agencies. This process is slow, unreliable, and lacks any way to verify a worker's skill, availability, or trustworthiness before hiring them. On the other side, skilled casual workers struggle to find consistent work without paying agency fees or relying entirely on word-of-mouth referrals.

### Solution Provided
FundiLink is a two-sided web platform connecting employers who need short-term work done with verified workers nearby. Employers post jobs with a category, location, and pay rate. Workers browse and filter jobs by trade, and apply directly through the platform — no agency, no middleman.

### Value Addition
- **No placement fees** — unlike traditional agencies, FundiLink doesn't take a cut from either side.
- **Location-based matching** — jobs and workers are matched by area, reducing wasted travel time across the city.
- **Verified profiles** — a registration and login system distinguishes between worker and employer accounts, laying the foundation for future verification/rating features.
- **Transparency** — pay rates (in KES) and job details are shown upfront, with no hidden costs.
- **Speed** — the entire flow from browsing to applying takes under a minute, versus days of back-and-forth over WhatsApp.



## Tech Stack

- **HTML5** — page structure across Home, Login/Register, Jobs, and Dashboard
- **CSS3** — custom design system (flat color palette, no frameworks), fully responsive
- **JavaScript (Vanilla)** — authentication logic, role-based routing, dynamic navigation
- **React** (via CDN + Babel standalone, no build step) — powers the Browse Jobs page: job listing, category filtering, and the apply flow are all built as React components with `useState`/`useEffect`
- **JSON Server** — mock REST API for users, jobs, and applications, backed by `db.json`
- **http-server** — lightweight static file server for local development


## Features

- **Two-sided registration** — sign up as either a Worker or an Employer
- **Role-based redirects** — workers land on the Jobs page after login, employers land on their Dashboard
- **Browse & filter jobs** — filter open gigs by category (Plumbing, Electrical, Cleaning, Painting, Moving, Gardening, Driving, Cooking, Security)
- **Apply to jobs** — one-click apply, persisted to a mock backend
- **Employer dashboard** — landing page for employers to (eventually) manage job postings
- **Fully responsive** — works down to mobile screen widths



## How to Run This Project

### Prerequisites
- [Node.js](https://nodejs.org) installed (includes `npm`)

### 1. Clone the repository
```bash
git clone https://github.com/Wahome-M/Casual-Worker-Sourcing-App.git
cd Casual-Worker-Sourcing-App


### 2. Start the mock API server
In one terminal, run:
```bash
npx json-server --watch src/db.json --port 3001
```
This serves `/users`, `/jobs`, and `/applications` at `http://localhost:3001`.

### 3. Start the static file server
In a **second** terminal (from the project root):
```bash
npx http-server . -p 8080
```

### 4. Open the app
Visit:http://localhost:8080/src/index.html
## Project Structure
Casual-Worker-Sourcing-App/
├── Images/              # Static images (worker photos, hero images)
├── src/
│   ├── index.html       # Homepage
│   ├── index.css
│   ├── login.html       # Login / Register
│   ├── login.css
│   ├── login.js
│   ├── jobs.html        # Browse Jobs (React-powered listing)
│   ├── jobs.css
│   ├── jobs.jsx
│   ├── dashboard.html   # Employer dashboard
│   ├── dashboard.css
│   ├── dashboard.js
│   ├── main.js          # Shared auth guard + nav logic
│   └── db.json          # Mock database (users, jobs, applications)
└── README.md


## Team

Built by **Group 8** ·  Strathmore University,Nairobi, Kenya · 2026



## Future Improvements
- Worker/employer rating and review system
- Real image upload for worker profile photos
- "Post a Job" form for employers
- "My Applications" tracker for workers
- Real backend + database (currently uses JSON Server as a mock API for development)
## Screenshots
