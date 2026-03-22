# PostgreSQL check commands

---

## If `netstat -an | findstr "5432"` returns nothing

**That means nothing is listening on port 5432 — PostgreSQL is not running.** Do one of the following.

### Option A: PostgreSQL is already installed — start the service

1. **Find the service name:**
   ```powershell
   Get-Service -Name "*postgres*"
   ```
   Note the name (e.g. `postgresql-x64-16`).

2. **Start it (run PowerShell as Administrator):**
   ```powershell
   Start-Service postgresql-x64-16
   ```
   Or use the name from step 1.

3. **Check again:**
   ```powershell
   netstat -an | findstr "5432"
   ```
   You should see a line with `LISTENING`.

### Option B: PostgreSQL is not installed — install it

If `Get-Service -Name "*postgres*"` returns nothing, PostgreSQL is not installed.

**Install on Windows:**

1. **Download the installer**
   - Go to: https://www.postgresql.org/download/windows/
   - Click **“Download the installer”** (from EDB).
   - Choose the latest **64-bit** version (e.g. PostgreSQL 16 or 17).

2. **Run the installer**
   - Double-click the downloaded `.exe`.
   - Click **Next** through the steps.
   - **Installation directory:** leave default (e.g. `C:\Program Files\PostgreSQL\16`).
   - **Select components:** keep **PostgreSQL Server**, **Command Line Tools** (and **pgAdmin 4** if you want a GUI). Click **Next**.

3. **Data directory:** leave default. Click **Next**.

4. **Set the postgres user password**
   - Enter a password (e.g. `admin`) and remember it.
   - Use this same value in your project `.env` as `DB_PASS=admin`.
   - Click **Next**.

5. **Port:** leave **5432**. Click **Next**.

6. **Locale:** leave default. Click **Next**.

7. Click **Next** to confirm, then **Install**. Wait for it to finish.

8. **Uncheck “Launch Stack Builder”** at the end and click **Finish**.

9. **Verify (open a new PowerShell):**
   ```powershell
   Get-Service -Name "*postgres*"
   netstat -an | findstr "5432"
   ```
   You should see the PostgreSQL service and a line with `LISTENING` on port 5432.

---

## 1. Check if PostgreSQL is running on port 5432

### Windows (PowerShell)
```powershell
# See if anything is listening on port 5432
netstat -an | findstr "5432"

# Or using Test-NetConnection (PowerShell)
Test-NetConnection -ComputerName localhost -Port 5432
```
- If PostgreSQL is running you should see `LISTENING` or `TcpTestSucceeded : True`.

### Windows (Command Prompt)
```cmd
netstat -an | findstr "5432"
```

### Linux / Mac
```bash
# Check if port 5432 is in use
sudo lsof -i :5432

# Or
netstat -tlnp | grep 5432
```

---

## 2. Check PostgreSQL service (Windows)

```powershell
# List PostgreSQL services
Get-Service -Name "postgresql*"

# Start PostgreSQL (replace with your version name if different)
Start-Service postgresql-x64-16
# Or: net start postgresql-x64-16
```

---

## 3. Connect to PostgreSQL and list databases

### Using psql (if installed and in PATH)

```powershell
# Connect as user "postgres" (will prompt for password)
psql -U postgres -h localhost -p 5432

# Or with password via env (Linux/Mac)
PGPASSWORD=admin psql -U postgres -h localhost -p 5432 -c "\l"
```

**Inside psql:**
```sql
-- List all databases
\l

-- Or
SELECT datname FROM pg_database;

-- Check if jewelry_db exists
SELECT datname FROM pg_database WHERE datname = 'jewelry_db';

-- Create database if needed (run as postgres user)
CREATE DATABASE jewelry_db;

-- Quit psql
\q
```

### One-liner to list databases (Windows PowerShell)
```powershell
$env:PGPASSWORD="admin"; psql -U postgres -h localhost -p 5432 -c "\l"
```

---

## 4. Quick test connection (Node.js)

From project root:
```powershell
node -e "const {Client}=require('pg');const c=new Client({host:'localhost',port:5432,user:'postgres',password:'admin',database:'postgres'});c.connect().then(()=>{console.log('PostgreSQL OK on port 5432');return c.query('SELECT datname FROM pg_database');}).then(r=>{console.log('Databases:',r.rows.map(x=>x.datname));c.end();}).catch(e=>{console.error('Failed:',e.message);process.exit(1);});"
```

---

## Summary

| Check              | Command (PowerShell) |
|--------------------|----------------------|
| Port 5432 in use  | `netstat -an \| findstr "5432"` |
| Test port         | `Test-NetConnection localhost -Port 5432` |
| List databases    | `psql -U postgres -h localhost -p 5432 -c "\l"` |
| Create DB         | `psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE jewelry_db;"` |
