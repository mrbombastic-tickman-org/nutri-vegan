# Nutri-Vegan

A Next.js application for diet planning and vegan nutrition.

## Project Setup Instructions

Follow these steps to set up the project on a new machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 18 or higher)
- [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mrbombastic-tickman-org/nutri-vegan.git
    cd nutri-vegan
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the **root directory of the project** (inside the `nutri-vegan` folder) and add the following keys (you will need to obtain the values from the project administrator or your existing setup):

    ```env
    # Database URLs
    DATABASE_URL="your_database_url_here"
    DIRECT_URL="your_direct_url_here"

    # NVIDIA API
    NVIDIA_API_KEY="your_nvidia_api_key_here"
    NVIDIA_BASE_URL="https://integrate.api.nvidia.com/v1"

    # Google Gemini API
    GOOGLE_API_KEY="your_google_api_key_here"

    # NextAuth
    NEXTAUTH_SECRET="your_nextauth_secret_here"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  **Database Setup:**
    Push the database schema to your database instance:
    ```bash
    npx prisma db push
    ```
    *(Optional) Seed the database if needed:*
    ```bash
    npm run db:seed
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

6.  **Open the application:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.
