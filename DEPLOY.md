# Deploy to Vercel - Step by Step Guide

## Method 1: Deploy via Vercel Website (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub, GitLab, or Bitbucket
3. **Click "Add New Project"**
4. **Import your repository**:
   - If your code is on GitHub/GitLab, connect your account and select the repository
   - If not, you'll need to push to GitHub first (see Method 2)

5. **Configure Project**:
   - Framework Preset: **Other** (or leave as default)
   - Root Directory: `./` (current directory)
   - Build Command: Leave empty (static site)
   - Output Directory: Leave empty

6. **Click "Deploy"**
7. **Wait for deployment** (usually takes 1-2 minutes)
8. **Your site will be live!** You'll get a URL like: `https://your-project.vercel.app`

## Method 2: Deploy via Command Line

### Step 1: Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Push to GitHub (if not already)
1. Create a new repository on GitHub
2. Push your code:
```bash
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy with Vercel CLI
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name? (Press Enter for default)
- Directory? (Press Enter for current directory)
- Override settings? **No**

### Step 4: Deploy to Production
```bash
vercel --prod
```

## Method 3: Drag & Drop (Quick Test)

1. Go to https://vercel.com/new
2. Drag and drop your project folder
3. Wait for deployment

## Important Notes

- ✅ Your `index.html` is the entry point
- ✅ No build process needed (static site)
- ✅ WebSocket connections work on Vercel
- ✅ HTTPS is automatically enabled (required for microphone access)

## After Deployment

1. Your site will be live at: `https://your-project.vercel.app`
2. Test the microphone access (HTTPS is required)
3. Share the URL with others!

## Troubleshooting

- **Microphone not working?** Make sure you're using HTTPS (Vercel provides this automatically)
- **WebSocket connection failed?** Check browser console for errors
- **Agent not responding?** Verify your agent ID is correct in `index.html`

