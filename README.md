# Rebekah's Recipes

Rebekah's Recipes is a family-focused recipe web application built using **Next.js** and **MongoDB**. The app allows users to browse and search for recipes, as well as filter by food categories such as Beef, Chicken, Pasta, and more. The site is designed with a modern and responsive UI using **Material UI** and integrates recipe data from a **MongoDB Atlas** database.

## Features

- **Recipe Categories**: Browse and filter recipes by category (Beef, Chicken, Pasta, etc.).
- **Search Functionality**: Easily search for specific recipes using the search bar.
- **Responsive Design**: Mobile-first design with a responsive layout using Material UI components.
- **Dynamic Filtering**: Use a dynamic category filter in the Drawer component to filter recipes.
- **Drawer Navigation**: Mobile-friendly navigation with a Material UI drawer component.

## Technologies Used

- **Next.js 14**: Framework for server-side rendering and building modern React apps.
- **MongoDB Atlas**: Cloud-based NoSQL database to store recipes and ingredients.
- **Mongoose**: ORM used for interacting with the MongoDB database.
- **Material UI**: Modern UI component library for React, used for building responsive layouts and components.
- **Cloudinary** (Planned): Image hosting solution to store and display recipe images.

## Getting Started

### Prerequisites

To run this project locally, you’ll need:

- Node.js v22 or higher
- MongoDB Atlas account (or local MongoDB setup)
- Git

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/aejmcclelland/recipe-app.git
    cd recipe-app
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Set up your environment variables:
   - Create a `.env` file in the root of the project.
   - Add the following environment variables:
     ```plaintext
     MONGODB_URI=<Your MongoDB Atlas connection string>
     ```

4. Seed the MongoDB database with the sample data:
    ```bash
    node seedDB.js
    ```

### Running the App

1. Start the development server:
    ```bash
    npm run dev
    ```

2. Open the app in your browser:
    ```
    http://localhost:3000
    ```
## Deployment

To deploy this application, consider using:

- **Vercel**: Deploy your Next.js app with ease using Vercel (Next.js' hosting platform).
- **MongoDB Atlas**: Ensure your database is hosted in the cloud for easy access.

## Planned Features

- **User Authentication**: Allow users to sign in and submit their own recipes.
- **Recipe Ratings**: Enable users to rate and like recipes.
- **Cloudinary Image Storage**: Store images using Cloudinary for optimized loading and management.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.