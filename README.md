# Ola Western Campaign Website

This is the official campaign website for Hon. Ola Western, candidate for the Amuwo-Odofin Federal Constituency.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Content Management**: [Contentful](https://www.contentful.com/)
- **Deployment**: Vercel / Netlify

---

## Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    This project uses Contentful to manage the blog. You will need to create a `.env.local` file in the root of the project and add your Contentful credentials.

    See the "Contentful Integration" section below for detailed instructions.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Contentful Integration

The blog is powered by a headless CMS (Contentful) to allow for dynamic content updates without needing to redeploy the site.

### How It Works

- Blog posts are fetched from the Contentful Content Delivery API.
- The connection details are stored securely in environment variables.

### Setup Instructions

1.  **Create a Contentful Account:**
    If you don't have one already, sign up for a free account at [Contentful.com](https://www.contentful.com).

2.  **Find Your Credentials:**
    In your Contentful space, navigate to **Settings > API keys**. Here you will find your:
    - **Space ID**
    - **Content Delivery API - Access Token**

3.  **Create the Environment File:**
    In the root of the project, create a file named `.env.local`. Copy the contents of `.env.example` into it and add your credentials:

    ```
    CONTENTFUL_SPACE_ID=your_space_id_here
    CONTENTFUL_ACCESS_TOKEN=your_access_token_here
    ```

4.  **Create the Content Model:**
    In your Contentful space, go to the **Content model** section and create a new content type with the following details:
    - **Name**: `Blog Post`
    - **API Identifier**: `blogPost`

    Add the following fields to this content model:
    - `title` (Short text)
    - `slug` (Short text, URL-friendly slug)
    - `date` (Date & time)
    - `author` (Short text)
    - `summary` (Long text)
    - `content` (Rich text)

Once this is set up, you can create and publish new entries in Contentful, and they will automatically appear on the website's blog.