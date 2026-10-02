# TIMEORA MongoDB Backup and Restore

### Backup MongoDB

```powershell
New-Item -ItemType Directory -Force -Path .\backups | Out-Null
mongodump --uri $env:MONGODB_URI --out ".\backups\$(Get-Date -Format yyyyMMdd)"
```

### Restore MongoDB

```powershell
mongorestore --uri $env:MONGODB_URI ".\backups\yyyyMMdd"
```

For MongoDB Atlas production databases, configure Atlas-managed backups and test restore procedures. Do not depend on Vercel function filesystems for persistent backups.
