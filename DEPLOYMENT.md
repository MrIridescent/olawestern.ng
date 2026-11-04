# Deployment Guide

This document provides a comprehensive guide to deploying and managing the Ola Western campaign website.

## Deployment to Netlify

The website is designed to be deployed on Netlify. To deploy the site, you will need to:

1.  Create a new site on Netlify and connect it to your Git repository.
2.  Set the build command to `npm run export:sites`.
3.  Set the `ADMIN_PASSWORD` environment variable in your Netlify project. This is crucial for securing your CMS.

## Build Command

The build command for this project is `npm run export:sites`. This command will build the site and export it as a static site, which is ideal for deployment on Netlify.

## Admin CMS

The website includes a robust admin CMS for managing the site's content. The CMS is protected by a password, which is set as an environment variable (`ADMIN_PASSWORD`) on the server.

### Accessing the CMS

To access the CMS, navigate to `/admin` on your website. You will be prompted to enter the admin password.

### CMS Features

The CMS is divided into several tabs, each managing a different aspect of the site's content:

*   **Truth Room:** Manage fact-checks, including adding, editing, and deleting entries.
*   **Media:** Manage the site's images.
*   **Video:** Manage the site's videos.
*   **Sources:** Manage the sources of your information.
*   **Site:** Manage the site's general copy.

## Backend

The backend is built with Next.js API routes and is responsible for handling all the CMS functionality. The API routes are located in the `/src/app/api/admin` directory.

### Authentication

Authentication is handled by the `/src/app/api/admin/login/route.ts` file. This file checks the provided password against the `ADMIN_PASSWORD` environment variable.

### Database

The website uses a Supabase database to store all of its content. The database is managed through the API routes.