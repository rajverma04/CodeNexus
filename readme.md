# CodeNexus: Advanced Competitive Programming Platform

## Project Description

**CodeNexus** is a full-stack web application designed to revolutionize competitive programming practice. Built on the **MERN Stack** (MongoDB, Express.js, React, Node.js), it provides a unified ecosystem for learning and problem-solving.

### Key Features
*   **Real-Time Code Execution**: Run code in C++, Java, Python, and JavaScript instantly using the **Judge0** API.
*   **AI-Powered Assistance**: Integrated **Google Gemini AI** acts as a 24/7 tutor, providing context-aware hints and debugging help.
*   **Rich Learning Resources**: In-browser video player for editorial solutions and concept explanations.
*   **Comprehensive Management**: Dedicated Admin dashboard for managing problems, test cases, and media.
*   **Secure & Scalable**: Features JWT authentication, Redis caching, and robust security practices.

---

## Getting Started & Installation

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Redis Server
- Valid accounts/API keys for:
  - Google Gemini AI
  - Cloudinary
  - Judge0 (or RapidAPI)
  - Google OAuth (Optional)
  - Brevo (Optional, for emails)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/codenexus.git
   cd codenexus
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   
   # MONGO_DB
   DB_CONNECTION_STRING=your_mongodb_connection_string
   
   # JWT SECRET_KEY
   JWT_KEY=your_jwt_secret_key
   
   # REDIS_CLIENT
   REDIS_PD=your_redis_password
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   
   # JUDGE0
   JUDGE0_KEY=your_judge0_api_key
   JUDGE0_URL=your_judge0_url
   JUDGE0_HOST=your_judge0_host
   
   # GOOGLE GEMINI_AI
   GEMINI_API_KEY=your_gemini_api_key
   
   # CLOUDINARY
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # FRONTEND_URL
   FRONTEND_URL=http://localhost:5173
   
   # GOOGLE OAUTH2.0
   CLIENT_ID=your_google_client_id
   
   # OTP email sending using Brevo
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_pass
   BREVO_API_KEY=your_brevo_api_key
   ```
   
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   
   Create a `.env` file in the `frontend` directory with the following variables:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
   
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`.
