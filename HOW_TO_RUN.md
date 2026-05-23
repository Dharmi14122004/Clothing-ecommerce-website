# How to Run MODA in VS Code

## 1. Open the project

1. Open **VS Code**
2. **File → Open Folder**
3. Select: `e commerce` (the folder that contains `backend` and `frontend`)
4. Click **Select Folder**

## 2. Install dependencies (first time only)

Open terminal: **Terminal → New Terminal** (or `` Ctrl+` ``)

**Backend:**
```powershell
cd backend
npm install
```

**Frontend** (new terminal or after backend finishes):
```powershell
cd frontend
npm install
```

## 3. Run the website

You need **two terminals** — backend and frontend.

### Option A — Two terminals (recommended)

**Terminal 1:**
```powershell
cd backend
npm run dev
```
Wait for: `MODA API running at http://localhost:5000`

**Terminal 2** (click **+** in terminal panel):
```powershell
cd frontend
npm run dev
```
Open the link shown (usually **http://localhost:3000**)

### Option B — VS Code Task (one click)

1. **Terminal → Run Task...**
2. Choose **MODA: Run Full App**
3. Two terminals start automatically
4. Open **http://localhost:3000** in your browser

## 4. Stop the servers

In each terminal press **Ctrl + C**

---

**Backend:** http://localhost:5000  
**Website:** http://localhost:3000  

Always start the **backend** before shopping on the site.
