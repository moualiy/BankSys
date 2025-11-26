# 🚀 DEPLOYMENT READY - Step-by-Step Guide

## ✅ WHAT HAS BEEN CREATED & READY TO DEPLOY

### ✨ NEW FILES CREATED (Just for You!)

```
✅ Dockerfiles (3 files)
   ├─ src/BankSystem.Api/Dockerfile (Backend)
   ├─ frontend/presentation-app/Dockerfile (Frontend)
   └─ .dockerignore files (3 files)

✅ Environment Files (3 files)
   ├─ .env.development (for development)
   ├─ .env.production (for production)
   └─ .env.example (template with all variables)

✅ Docker Compose (1 file)
   └─ docker-compose.yml (READY TO DEPLOY!)

✅ Total: 8 new deployment-ready files
```

---

## 🎯 YOUR PROJECT IS NOW READY TO DEPLOY!

All the files needed for Docker Compose deployment have been created:

```
✅ Bash database restoration script
✅ Fallback SQL schema script
✅ Production-ready Dockerfiles
✅ Environment configuration files
✅ Complete docker-compose.yml
✅ Comprehensive documentation
```

---

## 🚀 DEPLOYMENT STEPS (Follow in Order)

### STEP 1: Setup Environment (2 minutes)

```powershell
# Copy development environment to active .env file
Copy-Item .env.development .env

# Or use production (after updating passwords!)
Copy-Item .env.production .env
```

### STEP 2: Build Docker Images (5-10 minutes)

```powershell
# Build all three services
docker-compose build

# You should see:
# [1/5] Building banksystem-sqlserver...
# [2/5] Building banksystem-backend...
# [3/5] Building banksystem-frontend...
# Successfully built...
```

### STEP 3: Start Services (2-3 minutes)

```powershell
# Start all services in background
docker-compose up -d

# You should see:
# Creating banksystem-sqlserver... done
# Creating banksystem-backend... done
# Creating banksystem-frontend... done
```

### STEP 4: Wait for Services to be Ready (30-60 seconds)

```powershell
# Watch the startup process
docker-compose logs -f sqlserver

# You should see:
# [INFO] Bank System Database Restoration Script
# [SUCCESS] SQL Server is ready!
# [SUCCESS] Database restoration completed!
```

### STEP 5: Verify Everything Works (5 minutes)

#### 5a. Check SQL Server
```powershell
# View restoration logs
docker exec banksystem-sqlserver cat /var/opt/mssql/backup/restore.log

# Should see: SUCCESS messages
```

#### 5b. Check Database Exists
```powershell
# List databases
docker exec banksystem-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost,1433 -U sa -P sa123456 -Q "SELECT name FROM sys.databases WHERE name='Bank'"

# Should return: Bank
```

#### 5c. Check Database Tables
```powershell
# List tables
docker exec banksystem-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost,1433 -U sa -P sa123456 -d Bank -Q "SELECT name FROM sys.tables"

# Should show:
# Users
# Clients
# Transactions
# TransferLog
# LoginRegister
```

#### 5d. Test Backend API
```powershell
# Option 1: Using curl
curl http://localhost:5000/api/users

# Option 2: Open browser
http://localhost:5000/swagger/index.html

# Should return JSON user list or Swagger UI
```

#### 5e. Test Frontend
```powershell
# Open browser
http://localhost:3000

# Should show React Bank System UI
```

---

## 📊 SERVICE STATUS

```powershell
# Check all services running
docker-compose ps

# Expected output:
NAME                 STATUS
banksystem-sqlserver Running (healthy)
banksystem-backend   Running
banksystem-frontend  Running
```

---

## 🔧 USEFUL COMMANDS

### View Logs

```powershell
# SQL Server logs
docker-compose logs sqlserver

# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# All logs with follow (-f for live updates)
docker-compose logs -f

# Last 50 lines
docker-compose logs -f --tail=50
```

### Manage Services

```powershell
# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop backend

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart sqlserver

# Stop and remove containers
docker-compose down

# Stop, remove containers AND volumes (DELETES DATA!)
docker-compose down -v
```

### Database Operations

```powershell
# Access SQL Server terminal
docker exec -it banksystem-sqlserver bash

# Run SQL queries
docker exec banksystem-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost,1433 -U sa -P sa123456 -Q "SELECT COUNT(*) FROM Bank.dbo.Users"

# Backup database
docker exec banksystem-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost,1433 -U sa -P sa123456 -Q "BACKUP DATABASE [Bank] TO DISK = N'/var/opt/mssql/backup/Bank_backup_$(date +%Y%m%d).bak'"
```

---

## 🧪 QUICK TEST CHECKLIST

- [ ] **Step 1**: Environment setup (copy .env file)
- [ ] **Step 2**: Build images (`docker-compose build`)
- [ ] **Step 3**: Start services (`docker-compose up -d`)
- [ ] **Step 4**: Wait for startup (check logs)
- [ ] **Step 5a**: Check restoration logs
- [ ] **Step 5b**: Verify Bank database exists
- [ ] **Step 5c**: Verify tables exist
- [ ] **Step 5d**: Test API (curl or Swagger)
- [ ] **Step 5e**: Test Frontend (browser)
- [ ] **Status**: Check all services running

---

## ✅ EXPECTED RESULTS

### If Everything Works ✅

```
✅ SQL Server running and healthy
✅ Database 'Bank' restored successfully
✅ All tables created (Users, Clients, etc.)
✅ Backend API responding at localhost:5000
✅ Frontend UI accessible at localhost:3000
✅ API calls from frontend working
✅ No error messages in logs
```

### If Something Fails ❌

**See troubleshooting section below**

---

## 🆘 TROUBLESHOOTING

### Issue: "Cannot connect to database"

```powershell
# Check SQL Server is running
docker-compose ps

# Check SQL Server health
docker exec banksystem-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost,1433 -U sa -P sa123456 -Q "SELECT 1"

# View SQL Server logs
docker exec banksystem-sqlserver cat /var/opt/mssql/log/errorlog | tail -20
```

### Issue: "Bash script did not complete restoration"

```powershell
# Check restoration logs
docker exec banksystem-sqlserver cat /var/opt/mssql/backup/restore.log

# Check SQL Server container logs
docker-compose logs sqlserver
```

### Issue: "Database 'Bank' does not exist"

```powershell
# Check all databases
docker exec banksystem-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost,1433 -U sa -P sa123456 -Q "SELECT name FROM sys.databases"

# Check if backup file was mounted
docker exec banksystem-sqlserver ls -lh /var/opt/mssql/backup/
```

### Issue: "Cannot access API"

```powershell
# Check backend container is running
docker-compose ps backend

# Check backend logs
docker-compose logs backend

# Test connectivity
curl http://localhost:5000/api/users
```

### Issue: "Frontend cannot reach backend"

```powershell
# Check CORS configuration in logs
docker-compose logs backend | grep -i cors

# Check if both are on same network
docker network inspect banksystem-network

# Test internal connectivity
docker exec banksystem-frontend curl http://backend:8080/api/users
```

### Issue: "Port already in use"

```powershell
# Kill existing process (example for port 5000)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
# BACKEND_PORT=5001
```

---

## 📋 ENVIRONMENT VARIABLES EXPLAINED

### .env.development (for local development)

```env
# SQL Server - Default development password
MSSQL_SA_PASSWORD=sa123456

# API - Development settings
ASPNETCORE_ENVIRONMENT=Development
ENABLE_SWAGGER=true
DEBUG=true

# Frontend - Connect to localhost
REACT_APP_API_URL=http://localhost:5000

# Ports
SQL_PORT=1433
BACKEND_PORT=5000
FRONTEND_PORT=3000
```

### .env.production (for production)

```env
# SQL Server - MUST change this!
MSSQL_SA_PASSWORD=ChangeMe@SecurePassword123!

# API - Production settings
ASPNETCORE_ENVIRONMENT=Production
ENABLE_SWAGGER=false
DEBUG=false

# Frontend - Use your domain
REACT_APP_API_URL=http://api.yourdomain.com:5000

# Security
SECURITY_ENABLE_HTTPS=true
SECURITY_ENABLE_HSTS=true
```

---

## 🔐 PRODUCTION CHECKLIST

Before deploying to production:

- [ ] Change SQL Server password in `.env.production`
- [ ] Update `REACT_APP_API_URL` to your domain
- [ ] Update `CORS_ORIGINS` to your domains
- [ ] Set `ASPNETCORE_ENVIRONMENT=Production`
- [ ] Disable Swagger: `ENABLE_SWAGGER=false`
- [ ] Disable debug mode: `DEBUG=false`
- [ ] Enable HTTPS: `SECURITY_ENABLE_HTTPS=true`
- [ ] Use strong passwords (min 12 chars, mixed case, numbers, symbols)
- [ ] Enable HSTS: `SECURITY_ENABLE_HSTS=true`
- [ ] Review health checks are passing
- [ ] Test all API endpoints
- [ ] Test database backups
- [ ] Configure log aggregation
- [ ] Set up monitoring and alerts

---

## 📁 FILES STRUCTURE AFTER DEPLOYMENT

```
BankSystem/
├── docker-compose.yml ✅ (ready to deploy)
├── .env ← Create from .env.development or .env.production
├── .env.development ✅ (template for development)
├── .env.production ✅ (template for production)
├── .env.example ✅ (reference for all variables)
│
├── src/
│   └── BankSystem.Api/
│       ├── Dockerfile ✅ (ready to use)
│       └── .dockerignore ✅ (optimized)
│
├── frontend/
│   └── presentation-app/
│       ├── Dockerfile ✅ (ready to use)
│       └── .dockerignore ✅ (optimized)
│
├── docker/
│   └── mssql-init/
│       ├── restore-database.sh ✅ (auto-restoration)
│       └── 02-create-tables.sql ✅ (fallback)
│
├── db/
│   └── Bank_backup.bak ✅ (your database backup)
│
└── (documentation files)
```

---

## 🎯 NEXT STEPS SUMMARY

```
1. Copy environment: cp .env.development .env
2. Build images: docker-compose build
3. Start services: docker-compose up -d
4. Wait ~60 seconds for startup
5. Verify logs: docker-compose logs sqlserver
6. Test API: curl http://localhost:5000/api/users
7. Test Frontend: http://localhost:3000
8. Check all services: docker-compose ps
9. Success! 🎉
```

---

## ⏱️ TOTAL TIME ESTIMATE

```
Setup environment:    2 minutes
Build images:         5-10 minutes
Start services:       2-3 minutes
Wait for startup:     30-60 seconds
Verify everything:    5 minutes
─────────────────────────────────
TOTAL:                ~20-30 minutes
```

---

## 📞 NEED HELP?

**Refer to:**
- Bash script issues → `BASH_SCRIPT_REFERENCE.md`
- Docker issues → `plan_to_dockerCompose.md`
- Architecture → `ARCHITECTURE_DIAGRAMS.md`
- Complete guide → `plan_to_dockerCompose.md`

---

**Your Bank System is ready to deploy!** 🚀

All files are created and configured. Just follow these steps and you'll have a fully functional Docker Compose setup running on your machine.

**Time to deployment: ~20-30 minutes**

Let's go! 🐳✨
