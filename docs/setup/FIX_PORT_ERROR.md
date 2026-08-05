# Fix: Port 5000 Already in Use

## The Problem

Error: `EADDRINUSE: address already in use :::5000`

This means another process is already using port 5000. This is usually because:
- You have another server instance still running
- Another application is using port 5000

## Solutions

### Option 1: Stop the Existing Process (Recommended)

1. **Find what's using port 5000:**
   ```powershell
   Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess
   ```

2. **Kill the process:**
   ```powershell
   Stop-Process -Id <PID> -Force
   ```
   (Replace `<PID>` with the process ID from step 1)

3. **Or simply:** Look for any terminal windows running `npm run dev` and stop them (Ctrl+C)

### Option 2: Use a Different Port

1. Open your `.env` file
2. Change the port:
   ```
   PORT=3000
   ```
   (or any other available port like 3001, 8000, etc.)

3. Start the server:
   ```bash
   npm run dev
   ```

4. Access the website at the new port:
   - If PORT=3000: http://localhost:3000
   - If PORT=8000: http://localhost:8000

### Option 3: Quick Fix - Kill All Node Processes

**Warning:** This will stop ALL Node.js processes on your computer.

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Then start your server again:
```bash
npm run dev
```

## Recommended Approach

1. Check if you have another terminal window with the server running
2. If yes, go to that terminal and press Ctrl+C to stop it
3. If no, use Option 1 to find and kill the process
4. Then run `npm run dev` again

