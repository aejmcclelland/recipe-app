# Rebekah's Recipes

[![Playwright Tests](https://github.com/aejmcclelland/recipe-app/actions/workflows/playwright.yml/badge.svg)](https://github.com/aejmcclelland/recipe-app/actions/workflows/playwright.yml)

Rebekah's Recipes is a full-stack recipe management application built with **Next.js 16**, **React 19**, **TypeScript**, and **MongoDB Atlas**. It enables users to discover, create, manage and import recipes through a modern responsive interface while demonstrating production-ready authentication, security and deployment practices.

## Why I Built This

I originally built Rebekah's Recipes when my daughter went away to university and had to cook for herself for the first time. Although she enjoys cooking and baking, she would often phone or text home asking for recipes we'd cooked together over the years. Many of these were family favourites, while others had been adapted from websites such as BBC Good Food.

My original goal was simply to create a place where family members could share recipes with one another. During development, however, I realised that most of the recipes we actually used already existed online. That shifted the focus of the project towards solving a different problem.

Modern recipe websites often contain large amounts of advertising and lengthy content before you reach the ingredients and cooking method. I wanted a way to save those recipes in a clean, distraction-free format while still being able to organise them into a personal collection.

The application now allows users to import recipes directly from supported websites, store them in their own account, edit them, bookmark them, print them and manage them alongside their own recipes. What began as a simple family project has evolved into a full-stack application demonstrating modern web development, secure authentication, web scraping and cloud deployment.

---

## Features

### Authentication & User Accounts

- Secure authentication with **NextAuth**
- Google OAuth sign in
- Email/password authentication
- Email verification workflow
- Password reset via secure email tokens
- JWT session management
- Password hashing using **bcrypt**
- Password strength validation
- Protection against account enumeration attacks

---

### Recipe Management

- Create, read, update and delete recipes
- Dynamic ingredients and preparation steps
- Cooking times and serving sizes
- Recipe categories
- Recipe bookmarking
- Ownership validation so users can only edit or delete their own recipes
- Cloudinary image uploads

---

### Recipe Import

Import recipes directly from supported cooking websites.

Current supported sites include:

- BBC Good Food
- BBC Food
- Jamie Oliver

The import pipeline includes:

- URL validation
- Domain allow-listing
- Structured recipe extraction
- Automatic ingredient and instruction parsing

---

### Security

The application has been designed with security in mind and includes:

- Upstash Redis distributed rate limiting
- Sliding-window rate limiting
- Secure in-memory fallback for local development
- Protected server actions
- Protected API routes
- Email verification before privileged actions
- Secure password reset tokens
- Input validation
- Ownership checks
- Production-safe defaults

Rate limiting currently protects:

- Registration
- Login
- Password reset
- Recipe creation
- Website recipe imports

---

### User Experience

- Responsive Material UI interface
- Mobile-first layout
- Search functionality
- Category filtering
- Responsive navigation drawer
- Server Components
- Server Actions
- Optimised loading experience

---

### SEO

Built using modern SEO practices including:

- Dynamic metadata
- Open Graph metadata
- Twitter Cards
- JSON-LD structured data
- Dynamic sitemap generation
- robots.txt generation

---

### Testing & Quality

- Playwright end-to-end tests
- GitHub Actions CI
- TypeScript
- Production builds verified before deployment

---

### Analytics

- Vercel Analytics
- Vercel Speed Insights

---

## Technology Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Material UI

### Backend

- Next.js App Router
- Server Components
- Server Actions
- NextAuth

### Database

- MongoDB Atlas
- Mongoose

### Cloud Services

- Cloudinary
- Upstash Redis
- Maileroo
- Vercel

### Testing

- Playwright

---

## Getting Started

### Prerequisites

To run the project locally you'll need:

- Node.js 22 or later
- npm
- MongoDB Atlas account (or local MongoDB)
- Git

---

### Installation

Clone the repository:

```bash
git clone https://github.com/aejmcclelland/recipe-app.git
cd recipe-app
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure the required environment variables.

These include:

- MongoDB connection
- NextAuth configuration
- Google OAuth credentials
- Cloudinary credentials
- Upstash Redis credentials
- Maileroo credentials

Run the development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## Deployment

The application is designed for deployment on **Vercel**.

Production deployment uses:

- Vercel
- MongoDB Atlas
- Cloudinary
- Upstash Redis
- Maileroo

Configure the same environment variables in your Vercel project before deploying.

---

## Project Goals

This project demonstrates experience with:

- Modern React development
- Next.js App Router
- Full-stack TypeScript development
- Authentication and authorisation
- RESTful API design
- MongoDB data modelling
- Secure application development
- Production deployment
- Responsive UI development
- Automated end-to-end testing

---

## Future Improvements

Potential future enhancements include:

- Recipe ratings and reviews
- Meal planning
- Shopping lists
- Nutrition information
- Social recipe sharing
- Recipe collections

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.