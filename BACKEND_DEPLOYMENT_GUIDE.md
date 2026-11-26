# Backend Deployment Guide (Django + WebSockets) — VELTRIX ARENA

## 📌 Architecture Samajhein:
- **Frontend (Next.js)** ➔ **Vercel** par host hota hai. (Vercel sirf Frontend aur Node.js ke liye hota hai, Python/Django server ke liye nahi).
- **Backend (Django + SQLite/PostgreSQL + Channels)** ➔ **Render.com** ya **Railway.app** par host hota hai (Free / Cheap Cloud Services).

---

## ⚡ Option 1: Render.com Par Backend Deploy Karein (Free & Popular)

1. **[render.com](https://render.com)** par free account banayein (GitHub se login karein).
2. Dashboard me **"New +"** par click karke **"Web Service"** select karein.
3. Apna GitHub repository choose karein.
4. Settings fill karein:
   - **Name**: `veltrix-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt && python manage.py migrate
     ```
   - **Start Command**: 
     ```bash
     daphne -b 0.0.0.0 -p $PORT veltrix.asgi:application
     ```
5. **Create Web Service** par click karein.
6. 2-3 minute me Render aapko ek live URL dega:
   `https://veltrix-backend.onrender.com`

---

## 🔗 Frontend (Vercel) aur Backend (Render) ko Aapas Me Kaise Jodein?

1. Apne **Vercel Dashboard** par jayein (`vercel.com`).
2. Apne `veltrix-arena` project par click karein.
3. **Settings** ➔ **Environment Variables** me jayein.
4. Naya variable add karein:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://veltrix-backend.onrender.com/api`
5. **Save** karein aur **Redeploy** dabayein!

---

## 🎮 Kya Frontend Bina Backend Ke Vercel Par Chal Sakta Hai?
**Haan, Bilkul!**
Frontend me humne **Full Client-Side Demo Engine & Fallbacks** banaye hain:
- Aviator (AeroCrash) plane crash algorithm client par chalta hai.
- Carrom 2D authentic rigid-body physics aur sounds browser me chalte hain.
- Dragon Tiger aur Teen Patti cards instant simulation ke sath deal hote hain.
- Demo balances aur QR code generation bina backend ke bhi demo mode me active rehte hain!
