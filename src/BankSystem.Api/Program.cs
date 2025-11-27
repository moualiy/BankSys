using BankSystem.Business.Services;
using BankSystem.Data;
using BankSystem.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;

var builder = WebApplication.CreateBuilder(args);

// Allow appsettings / secrets to override the database connection string that the data layer uses.
BankConnection.Configure(builder.Configuration.GetConnectionString("Default"));

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

// Register business services
builder.Services.AddScoped<UserService>();

builder.Services.AddScoped<ClientService>();
builder.Services.AddScoped<TransactionService>();
builder.Services.AddScoped<LoginRegisterService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://localhost:3000", "http://localhost:5167", "http://localhost:3001", "http://frontend:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("AllowSpecificOrigin");

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "BankSystem API V1");
    c.RoutePrefix = "swagger";
});

// Serve static files from wwwroot (React build)
app.UseDefaultFiles();
app.UseStaticFiles();

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", message = "BankSystem API is running" }))
    .WithName("HealthCheck")
    .WithTags("Health");

// app.UseHttpsRedirection();

// API endpoints will be defined here
app.MapPost("/api/users/register", ([FromBody] User user, UserService userService) =>
{
    try
    {
        var newUser = userService.Register(user);
        return Results.Ok(newUser);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
})
.WithName("RegisterUser")
.WithTags("Users");

app.MapGet("/api/login-register", (LoginRegisterService loginRegisterService) =>
{
    var activities = loginRegisterService.GetLoginActivities();
    return Results.Ok(activities);
})
.WithName("GetLoginActivities")
.WithTags("Users");

app.MapPost("/api/users/login", ([FromBody] LoginRequest loginRequest, UserService userService) =>
{
    var user = userService.Login(loginRequest.Username, loginRequest.Password);
    if (user == null)
    {
        return Results.Unauthorized();
    }
    return Results.Ok(user);
})
.WithName("LoginUser")
.WithTags("Users");

app.MapGet("/api/users", (UserService userService) =>
{
    var users = userService.GetAllUsers();
    return Results.Ok(users);
})
.WithName("GetUsers")
.WithTags("Users");


app.MapGet("/api/users/{id}", (int id, UserService userService) =>
{
    var user = userService.FindById(id);
    if (user == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(user);
})
.WithName("GetUserById")
.WithTags("Users");

app.MapGet("/api/users/username/{username}", (string username, UserService userService) =>
{
    var user = userService.FindByUsername(username);
    if (user == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(user);
})
.WithName("GetUserByUsername")
.WithTags("Users");

// Update user
app.MapPut("/api/users/{id}", (int id, [FromBody] User user, UserService userService) =>
{
    if (id != user.Id)
    {
        return Results.BadRequest("User ID mismatch");
    }

    try
    {
        userService.UpdateUser(user);
        return Results.Ok(user);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
})
.WithName("UpdateUser")
.WithTags("Users");

// Delete user
app.MapDelete("/api/users/{id}", (int id, UserService userService) =>
{
    try
    {
        userService.DeleteUser(id);
        return Results.NoContent();
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
})
.WithName("DeleteUser")
.WithTags("Users");


app.MapGet("/api/clients", (ClientService clientService) =>
{
    var clients = clientService.GetAllClients();
    return Results.Ok(clients);
})
.WithName("GetClients")
.WithTags("Clients");

app.MapGet("/api/clients/{id}", (int id, ClientService clientService) =>
{
    var client = clientService.FindClient(id);
    if (client == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(client);
})
.WithName("GetClientById")
.WithTags("Clients");

app.MapPost("/api/clients", ([FromBody] Client client, ClientService clientService) =>
{
    try
    {
        var newClientId = clientService.AddNewClient(client);
        return Results.Created($"/api/clients/{newClientId}", client);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
})
.WithName("CreateClient")
.WithTags("Clients");

app.MapPut("/api/clients/{id}", (int id, [FromBody] Client client, ClientService clientService) =>
{
    if (id != client.Id)
    {
        return Results.BadRequest("Client ID mismatch");
    }

    try
    {
        clientService.UpdateClient(client);
        return Results.Ok(client);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
})
.WithName("UpdateClient")
.WithTags("Clients");

app.MapDelete("/api/clients/{id}", (int id, ClientService clientService) =>
{
    try
    {
        clientService.DeleteClient(id);
        return Results.NoContent();
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
})
.WithName("DeleteClient")
.WithTags("Clients");


app.MapPost("/api/transactions/deposit", ([FromBody] DepositRequest request, TransactionService transactionService) =>
{
    try
    {
        var result = transactionService.Deposit(request.ClientId, request.Amount);
        if (result > 0)
        {
            return Results.Ok("Deposit successful.");
        }
        return Results.BadRequest("Deposit failed.");
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
})
.WithName("Deposit")
.WithTags("Transactions");

app.MapPost("/api/transactions/withdraw", ([FromBody] WithdrawRequest request, TransactionService transactionService) =>
{
    try
    {
        var result = transactionService.Withdraw(request.ClientId, request.Amount);
        if (result > 0)
        {
            return Results.Ok("Withdrawal successful.");
        }
        return Results.BadRequest("Withdrawal failed. Check for sufficient funds.");
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
})
.WithName("Withdraw")
.WithTags("Transactions");

app.MapGet("/api/transactions/total-balances", (TransactionService transactionService) =>
{
    var totalBalances = transactionService.GetTotalBalances();
    return Results.Ok(totalBalances);
})
.WithName("GetTotalBalances")
.WithTags("Transactions");

app.MapPost("/api/transactions/transfer", (HttpContext http, [FromBody] TransferRequest request, TransactionService transactionService) =>
{
    try
    {
        // Ensure request body is present
        if (request == null)
        {
            return Results.BadRequest("Missing transfer request body.");
        }

        // Determine authorized user id: prefer explicit value in body, fall back to X-User-Id header
        int authorizedByUserId = request.AuthorizedByUserId;

        if (authorizedByUserId == 0)
        {
            if (http.Request.Headers.TryGetValue("X-User-Id", out var headerVals))
            {
                if (int.TryParse(headerVals.ToString(), out var parsedId))
                {
                    authorizedByUserId = parsedId;
                }
            }
        }

        if (authorizedByUserId == 0)
        {
            // No authenticated user - return 401 with a helpful message
            return Results.Unauthorized();
        }

        var result = transactionService.Transfer(request.FromClientId, request.ToClientId, request.Amount, authorizedByUserId);
        if (result)
        {
            return Results.Ok("Transfer successful.");
        }
        return Results.BadRequest("Transfer failed. Check account details and balance.");
    }
    catch (ArgumentException ex)
    {
        // validation / domain errors
        return Results.BadRequest(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        // unexpected errors - return a ProblemDetails response
        return Results.Problem(detail: ex.Message, title: "Internal Server Error");
    }
})
.WithName("Transfer")
.WithTags("Transactions");

app.MapGet("/api/transactions/transfer-log", (TransactionService transactionService) =>
{
    var transferLog = transactionService.GetTransferLog();
    return Results.Ok(transferLog);
})
.WithName("GetTransferLog")
.WithTags("Transactions");

// Backwards-compatible endpoint for the frontend which expects "/api/transactions/history".
// Returns the same transfer log data (TransferLog entries).
app.MapGet("/api/transactions/history", (TransactionService transactionService) =>
{
    var history = transactionService.GetTransferLog();
    return Results.Ok(history);
})
.WithName("GetTransactionHistory")
.WithTags("Transactions");

// Fallback to serve React app for client-side routing
app.MapFallbackToFile("index.html");

app.Run();

// --- Seed default test user (for local development) ---
// This ensures a test account exists so the frontend can login during development.
// Note: low-risk, only creates the user if it does not already exist.
try
{
    using (var scope = app.Services.CreateScope())
    {
        var userService = scope.ServiceProvider.GetRequiredService<UserService>();
        // Check if test user exists
        var existing = userService.FindByUsername("User1");
        if (existing == null)
        {
            var testUser = new User
            {
                FirstName = "Test",
                LastName = "User",
                Email = "user1@example.com",
                UserName = "User1",
                PasswordHash = "1234", // stored plaintext in this sample app
                PermissionLevel = 1
            };
            userService.Register(testUser);
            Console.WriteLine("Seeded test user: User1 / 1234");
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Error seeding test user: {ex.Message}");
}
