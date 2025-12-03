# Deploying SehatStation (Frontend & Backend) on Vercel

This guide will help you deploy both the React frontend and Node.js/Express backend of your project to Vercel.

---

## Prerequisites

- GitHub account (or GitLab/Bitbucket)
- Vercel account ([https://vercel.com/](https://vercel.com/))
- Your project code pushed to a Git repository (with `client/` for frontend and `server/` for backend)

---

## 1. Prepare Your Project Structure

```
project-root/
  client/      # React frontend
  server/      # Node.js backend (Express)
```

---

## 2. Push Your Code to GitHub

1. Initialize a git repository if you haven't:
   ```sh
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

---

## 3. Deploy the Backend (server/) to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New... > Project"**.
3. Import your GitHub repository.
4. Set the **Root Directory** to `server`.
5. Set the **Framework Preset** to **"Other"**.
6. In **Build & Output Settings**:
   - **Build Command:** `npm install`
   - **Output Directory:** `.`
   - **Install Command:** `npm install`
   - **Development Command:** `npm run start` or `node index.js` (as per your `package.json`)
7. In **Environment Variables**, add any required variables (e.g., `MONGODB_URI`, `JWT_SECRET`, etc.).
8. Click **Deploy**.
9. After deployment, note the backend URL (e.g., `https://your-backend.vercel.app`).

---

## 4. Deploy the Frontend (client/) to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New... > Project"**.
3. Import your GitHub repository (again).
4. Set the **Root Directory** to `client`.
5. Set the **Framework Preset** to **"Create React App"** (or "Other" if using Vite, etc.).
6. In **Build & Output Settings**:
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`
7. In **Environment Variables**, set the backend API URL (e.g., `REACT_APP_API_URL=https://your-backend.vercel.app`).
8. Click **Deploy**.
9. After deployment, your frontend will be live at a Vercel URL (e.g., `https://your-frontend.vercel.app`).

---

## 5. Update API URLs in Frontend

- In your React app (`client/`), ensure all API calls use the environment variable (e.g., `process.env.REACT_APP_API_URL`).
- Update `databaseUrls.js` or similar config to use this variable.

---

## 6. (Optional) Custom Domain

- In Vercel, go to your project > Settings > Domains to add a custom domain.

---

## 7. Test Everything

- Visit your frontend URL and test all features.
- Ensure the frontend is communicating with the backend deployed on Vercel.

---

## 8. Troubleshooting

- Check Vercel build logs for errors.
- Make sure CORS is enabled in your backend for the frontend domain.
- Ensure all environment variables are set in Vercel dashboard for both projects.

---

## References

- [Vercel Docs](https://vercel.com/docs)
- [Deploy Node.js on Vercel](https://vercel.com/docs/solutions/node)
- [Deploy React on Vercel](https://vercel.com/docs/solutions/react)

---

**You have now deployed both your frontend and backend on Vercel!**
