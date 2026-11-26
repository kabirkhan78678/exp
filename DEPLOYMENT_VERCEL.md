# Vercel Deployment Guide — VELTRIX ARENA

Aap apni **VELTRIX ARENA** web app ko Vercel par 2 aasan tareeqon se upload kar sakte hain:

---

## ⚡ METHOD 1: Vercel CLI (Sabse Fast — Direct Terminal Se)

Kisi GitHub repository ki zaroorat nahi hai, seedha terminal se 2 minute me upload ho jayega:

### Step 1: Frontend directory me jao
```bash
cd frontend
```

### Step 2: Vercel Deploy Command chalao
```bash
npx vercel
```

### Step 3: Terminal me yeh options aayenge:
1. **Log in to Vercel**: Browser me window khulegi, apne GitHub/Google account se Sign in karein.
2. **Set up and deploy?**: `Y` press karein.
3. **Which scope?**: Apna username choose karke `Enter` dabayein.
4. **Link to existing project?**: `N` press karein.
5. **What's your project's name?**: `veltrix-arena` (ya apna manpasand naam) likh kar `Enter` dabayein.
6. **In which directory is your code located?**: `./` (sirf `Enter` dabayein).
7. **Want to modify settings?**: `N` press karein.

Deploy complete hone par aapko ek **Preview URL** mil jayega!

### Step 4: Production Link (Final Live URL)
```bash
npx vercel --prod
```
Aapko aapka official live URL mil jayega (e.g. `https://veltrix-arena.vercel.app`).

---

## 🌐 METHOD 2: GitHub ke Through (Auto-Deploy on Push)

Agar aap GitHub par repo banakar Vercel se connect karna chahte hain:

### Step 1: Code ko GitHub par push karein
```bash
git init
git add .
git commit -m "Veltrix Arena Royal Casino Full Stack"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

### Step 2: Vercel Dashboard par jao
1. [vercel.com](https://vercel.com) par login karein.
2. **"Add New..."** button par click karke **"Project"** choose karein.
3. Apna GitHub repository choose karke **"Import"** par click karein.

### Step 3: IMPORTANT Configuration (Zaroori Setting)
- **Framework Preset**: `Next.js` (auto-detected)
- **Root Directory**: `Edit` button dabakar **`frontend`** select karein! *(Kyunki Next.js app `frontend` folder me hai)*
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Step 4: Environment Variables (Optional)
Agar aapka backend kisi cloud server (e.g. Render, Railway) par host hai to:
- `NEXT_PUBLIC_API_URL` = `https://your-backend-api.com/api`
*(Agar nahi hai to default demo mode bina backend ke bhi smoothly chalega!)*

### Step 5: "Deploy" button dabayein
2 minute me aapki website live ho jayegi!
