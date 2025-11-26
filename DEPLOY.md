# 🚀 DEPLOYMENT - 3 SIMPLE COMMANDS

## Where to Execute the Commands

**Execute all commands in PowerShell from this directory:**
```
D:\WS2\BankSystem
```

## 3 Commands to Deploy Everything

### 1️⃣ Copy Environment Configuration
```powershell
Copy-Item .env.development .env
```
**What it does:** Copies development environment settings (SQL Server password, ports, API URLs)

---

### 2️⃣ Build Docker Images
```powershell
docker-compose build
```
**What it does:** Builds Docker images for:
- SQL Server (with database)
- Backend API (.NET 9)
- Frontend (React)

**⏱️ Time:** ~5-10 minutes (first time)

---

### 3️⃣ Start Services
```powershell
docker-compose up -d
```
**What it does:** Starts all 3 services in the background:
- SQL Server on port 1433
- Backend API on port 5000
- Frontend on port 3000

**⏱️ Time:** ~60 seconds

---

## ✅ Verify Everything Works

After ~30 seconds, test these URLs in your browser:

| Service | URL | Expected |
|---------|-----|----------|
| **Frontend** | http://localhost:3000 | React app loads |
| **API Swagger** | http://localhost:5000/swagger | Swagger UI appears |
| **API Health** | http://localhost:5000/health | JSON response |

---

## 📋 Database Restoration

The database is **automatically restored** during SQL Server startup:
- Backup file: `db/Bank_backup.bak`
- Restoration script: `docker/mssql-init/restore-database.sh`
- Status: Check logs with `docker-compose logs sqlserver`

---

## 🛑 Stop Services (When Done)

```powershell
docker-compose down
```

---

## 🐛 Troubleshooting

If something doesn't work, check logs:

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f sqlserver
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 📖 For More Details

See `DEPLOYMENT_READY.md` for:
- Extended troubleshooting
- Production deployment checklist
- Environment variable explanations
- Service verification procedures

---

**That's it! 3 commands and you're deployed.** ✨
