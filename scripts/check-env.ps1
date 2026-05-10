$required = @("DATABASE_URL", "REDIS_URL", "JWT_SECRET", "COOKIE_SECRET")
foreach ($name in $required) {
  if (-not [Environment]::GetEnvironmentVariable($name)) {
    Write-Host "Missing $name"
  }
}
