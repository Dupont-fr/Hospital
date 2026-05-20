$body = @{
    name = "Admin Principal"
    email = "admin@test.com"
    password = "Admin123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/api/users/register/admin' -Method POST -Body $body -ContentType 'application/json'
