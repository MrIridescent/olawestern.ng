# Ola Western Campaign CMS: The Complete Guide

## Introduction: Your Digital Campaign HQ

Welcome to the guide for the Ola Western campaign's custom-built Content Management System (CMS). This system is the central hub for controlling all content on the public-facing website, from the main headline on the homepage to the latest fact-check in the Truth Room.

This document provides a comprehensive, end-to-end rundown of the CMS architecture, its features, and step-by-step instructions for managing every aspect of your site's content.

---

## 1. Getting Started: Accessing the Dashboard

### Logging In

The entire CMS is protected behind a secure login screen.

1.  **Navigate to the Admin URL:** Open your web browser and go to `[YourWebsiteURL]/admin`.
2.  **Enter Credentials:** You will be prompted for a password. Enter the official campaign admin password to gain access.
3.  **Session:** Upon successful login, a secure session is created that lasts for 12 hours. You will not need to log in again during this period unless you manually log out.

**Security Note:** Access is handled by the `c:\Users\C0sm0s\Desktop\OlaWestern\src\app\api\admin\login\route.ts` endpoint. It uses a secure, signed, HTTP-only cookie (`ADMIN_COOKIE`) for session management, ensuring that only authorized users can access the admin API.

### The Main Dashboard View

Once logged in, you will see the **Admin Dashboard**. This is your command center. Based on the system's architecture, the dashboard is designed to provide:
*   **At-a-Glance Health Check:** An overview of the site's integrity, including the number of unpublished drafts, broken links, or missing images.
*   **Navigation:** Clear links to dedicated sections for managing each type of content (e.g., "Newsroom," "Media Library," "Help Desk").
*   **Quick Actions:** Buttons to create new content items, such as "New Press Release" or "New Fact Check."

---

## 2. Core Concepts: How It Works

Understanding two core concepts will help you appreciate the power and speed of this CMS.

### Headless Architecture

The CMS is "headless," which means the backend where you manage content is separate from the frontend that voters see.

*   **Backend (The CMS):** The admin dashboard and its corresponding API routes under `c:\Users\C0sm0s\Desktop\OlaWestern\src\app\api\admin\`.
*   **Frontend (The Website):** The public pages (`/`, `/about`, `/news`, etc.) that fetch data from the CMS to display it.

This separation makes the system incredibly flexible and secure.

### On-Demand Revalidation: Instant Live Updates

This is the system's most powerful feature. **You do not need to ask a developer to "deploy" or "publish" your changes.**

When you save an update in the CMS (e.g., change a headline or publish a new article), the system automatically and instantly rebuilds only the affected public pages in the background.

*   **How it works:** The API endpoints call Next.js's `revalidatePath()` function after every successful update.
*   **The result:** Your changes are live on the public website within seconds. This allows for true rapid response and ensures the website is always a live, up-to-the-minute source of information.

---

## 3. Managing Your Website Content

This section provides a detailed breakdown of each content module within the CMS.

### 3.1. Homepage & Site-wide Settings

This module controls the most prominent copy on your website.

*   **What you can manage:**
    *   **Hero Section:** The main headline, slogan, and introductory paragraph on the homepage.
    *   **Call to Action (CTA):** The title and body of the final, persuasive content band at the bottom of the homepage.
    *   **Ticker Stats:** The rotating statistics that appear on the homepage (e.g., "1,000+ Households Fed").
*   **How to use it:**
    1.  Navigate to the "Site Settings" or "Homepage Content" section in the dashboard.
    2.  Update the text in the provided fields.
    3.  Click "Save." Your changes will be live on the homepage instantly.
*   **Technical Details:** Managed by `c:\Users\C0sm0s\Desktop\OlaWestern\src\app\api\admin\settings\route.ts`.

### 3.2. The Truth Room: Managing Facts & Rumors

The Truth Room is your reputation defense hub. Use it to proactively publish facts and decisively debunk misinformation.

*   **What you can manage:**
    *   **Fact Checks:** Individual entries containing a claim, a verdict, and a detailed explanation with evidence.
    *   **Featured Rulings:** Pin specific, important fact-checks to the top of the Truth Room page.
*   **How to create a new Fact Check:**
    1.  Go to the "Truth Room" section and click "New Ruling."
    2.  **Claim Summary:** Write the claim or rumor you are addressing (e.g., "Candidate X promised Y").
    3.  **Verdict:** Select the official verdict from the dropdown: `VERIFIED FACT`, `FALSE CLAIM`, or `MISLEADING`.
    4.  **Detailed Explanation:** Provide the full context, evidence, and sources that support your verdict. This is where you build your case.
    5.  **Official Document URL:** **Crucially, link to the evidence.** This could be a PDF of a press release, a link to a news article, or a public record.
    6.  Click "Publish." The new ruling is now live.
*   **Technical Details:** Managed by `c:\Users\C0sm0s\Desktop\OlaWestern\src\app\api\admin\fact-checks\route.ts`.

### 3.3. The Newsroom: Publishing Press Releases

This module powers the `/news` page, serving as the campaign's official newsfeed.

*   **How to publish a new Press Release:**
    1.  Navigate to the "Newsroom" section and click "New Release."
    2.  **Title:** Enter the official headline of the press release.
    3.  **Source:** Categorize the release (e.g., `Campaign HQ`, `Community Press`).
    4.  **Summary:** Write a concise, one-paragraph summary. This is what appears in the newsfeed list.
    5.  **Body:** Paste the full text of the press release.
    6.  **PDF URL (Optional):** If you have a formatted PDF version, you can link to it here for journalists to download.
    7.  **Publish:** Set the status to "Published" and save. The release is now live on the `/news` page and the homepage preview.
*   **Technical Details:** Managed by `c:\Users\C0sm0s\Desktop\OlaWestern\src\app\api\admin\press\route.ts`.

### 3.4. The Media Library: Photos & Videos

A central repository for all your visual assets. This system is optimized to ensure high-quality, fast-loading images and videos.

*   **Uploading a New Photo:**
    1.  Go to the "Media Library" and select "Upload."
    2.  Drag and drop or select an image file (PNG, JPG, WEBP). The system has a 10MB size limit.
    3.  The API (`.../media/upload`) automatically processes the image, determines its dimensions, and creates a web-optimized version.
    4.  You will be prompted to add metadata. **Do not skip this.**
        *   **Alt Text:** A short, descriptive sentence for screen readers and SEO (e.g., "Ola Western speaking with market women at Agboju market").
        *   **Caption/Credit:** Optional details that may appear with the photo.
*   **Placing a Photo:** Once uploaded, you can assign a photo to a specific "slot" on the website, such as `candidate-portrait` or `hero-image`, right from the media library interface.
*   **Adding a Video:**
    1.  Go to the "Videos" section.
    2.  Paste a YouTube URL. The system uses the `.../videos/lookup` endpoint to automatically fetch the video's real title, channel, and thumbnail to prevent errors.
    3.  Add your own context (e.g., a title for the website) and publish. The video will appear on the `/gallery` page and in the "Video Shelf" component.
*   **Technical Details:** Managed by `c:\Users\C0sm0s\Desktop\OlaWestern\src\app\api\admin\media\` and `...\videos\` routes.

### 3.5. The Constituent Help Desk: Engaging with Voters

This module is the bridge between the public and the campaign team, capturing all incoming messages from the `/help-desk` page.

*   **What you can manage:**
    *   **Issues:** Reports from constituents about local problems (e.g., "Blocked drain on 23 Road").
    *   **Inquiries:** Questions and meeting requests submitted via the "Ask Ola" and "Book Open-Door Hours" forms.
*   **Workflow:**
    1.  New submissions appear in the "Help Desk" section of the admin dashboard.
    2.  You can review each item, see the constituent's details (kept private), and update its status (`New`, `Reviewed`, `Action Scheduled`, `Resolved`).
    3.  You can add a public `update_note` to an issue, which will be visible on the public progress dashboard. This is key for transparency.
*   **Maximizing Potential:** Use this not just as a ticketing system, but as a data source. Regularly analyze the types of issues and questions coming in to understand the most pressing concerns of voters in different wards.
*   **Technical Details:** Managed by `c:\Users\C0sm0s\Desktop\OlaWestern\src\app\api\admin\issues\` and `...\inquiries\` routes.

---

## 4. Maximizing Your Impact: Best Practices

*   **Be Fast and Factual:** The "Truth Room" is your most powerful rapid-response tool. When a rumor emerges, use the CMS to debunk it with sourced evidence in minutes, not hours.
*   **Keep the Record Live:** Regularly update the "Track Record" with new accomplishments, no matter how small. This builds a powerful, cumulative case for effectiveness.
*   **Tell a Story with Visuals:** Don't just upload photos—place them in the right slots. A powerful photo in the `hero-image` slot can have a huge impact. Ensure all images have descriptive alt text.
*   **Close the Loop:** Use the "Help Desk" to demonstrate responsiveness. When a constituent reports an issue, update its status and add a progress note. This shows the campaign is listening and acting.
*   **Consistency is Key:** Use a consistent tone and style across all your content, from press releases to fact-check explanations.

This CMS is more than a tool—it's a strategic asset. By using it to its full potential, you can run a more agile, responsive, and transparent campaign.