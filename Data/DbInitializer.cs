using Microsoft.EntityFrameworkCore;
using MSTARTTaskDB.Models;
using MSTARTTaskDB.Services;

namespace MSTARTTaskDB.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context, IAuthService authService)
        {
            context.Database.Migrate();

            if (context.Users.Any())
            {
                return;
            }

            // Create Users
            var admin = new User
            {
                Username = "admin",
                Email = "admin@example.com",
                Password = authService.HashPassword("Admin123!"),
                Phone = "+1234567890",
                Role = "Admin",
                Status = true,
                CreatedAt = DateTime.UtcNow
            };

            var user = new User
            {
                Username = "user",
                Email = "user@example.com",
                Password = authService.HashPassword("User123!"),
                Phone = "+1987654321",
                Role = "User",
                Status = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.AddRange(admin, user);
            context.SaveChanges();

            // Create Products
            var products = new[]
            {
                new Products
                {
                    Name = "Laptop Pro 15\"",
                    Description = "High-performance laptop with 16GB RAM and 512GB SSD",
                    Amount = 1299.99m,
                    Currency = "USD",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                },
                new Products
                {
                    Name = "Wireless Mouse",
                    Description = "Ergonomic wireless mouse with precision tracking",
                    Amount = 29.99m,
                    Currency = "USD",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                },
                new Products
                {
                    Name = "Mechanical Keyboard",
                    Description = "RGB backlit mechanical keyboard with Cherry MX switches",
                    Amount = 149.99m,
                    Currency = "USD",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                },
                new Products
                {
                    Name = "USB-C Hub",
                    Description = "7-in-1 USB-C hub with HDMI, USB 3.0, and card reader",
                    Amount = 49.99m,
                    Currency = "USD",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                },
                new Products
                {
                    Name = "Wireless Headphones",
                    Description = "Noise-cancelling wireless headphones with 30-hour battery",
                    Amount = 199.99m,
                    Currency = "USD",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                },
                new Products
                {
                    Name = "External SSD 1TB",
                    Description = "Portable external SSD with USB-C connectivity",
                    Amount = 129.99m,
                    Currency = "USD",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                },
                new Products
                {
                    Name = "Webcam HD",
                    Description = "1080p HD webcam with auto-focus and stereo microphones",
                    Amount = 79.99m,
                    Currency = "USD",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                },
                new Products
                {
                    Name = "Monitor 27\" 4K",
                    Description = "27-inch 4K UHD monitor with IPS panel and HDR support",
                    Amount = 449.99m,
                    Currency = "USD",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                },
                new Products
                {
                    Name = "Desk Lamp LED",
                    Description = "Adjustable LED desk lamp with touch controls",
                    Amount = 39.99m,
                    Currency = "USD",
                    Status = "Inactive",
                    CreatedAt = DateTime.UtcNow
                },
                new Products
                {
                    Name = "Cable Management Kit",
                    Description = "Complete cable management solution for desk organization",
                    Amount = 19.99m,
                    Currency = "USD",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Products.AddRange(products);
            context.SaveChanges();

            // Create Sample Orders
            var order1 = new Orders
            {
                UserId = user.Id,
                TotalAmount = 1479.97m,
                Status = "Completed",
                Currency = "USD",
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            };

            var order2 = new Orders
            {
                UserId = user.Id,
                TotalAmount = 679.97m,
                Status = "Pending",
                Currency = "USD",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            };

            var order3 = new Orders
            {
                UserId = admin.Id,
                TotalAmount = 229.98m,
                Status = "Completed",
                Currency = "USD",
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            };

            context.Orders.AddRange(order1, order2, order3);
            context.SaveChanges();

            // Create Order Items for Order 1 (Laptop + Mouse + Keyboard)
            var orderItems1 = new[]
            {
                new OrderItems
                {
                    OrderId = order1.Id,
                    ProductId = products[0].Id, // Laptop
                    Quantity = 1,
                    UnitPrice = products[0].Amount,
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new OrderItems
                {
                    OrderId = order1.Id,
                    ProductId = products[1].Id, // Mouse
                    Quantity = 1,
                    UnitPrice = products[1].Amount,
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new OrderItems
                {
                    OrderId = order1.Id,
                    ProductId = products[2].Id, // Keyboard
                    Quantity = 1,
                    UnitPrice = products[2].Amount,
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                }
            };

            // Create Order Items for Order 2 (Monitor + USB Hub + Webcam)
            var orderItems2 = new[]
            {
                new OrderItems
                {
                    OrderId = order2.Id,
                    ProductId = products[7].Id, // Monitor
                    Quantity = 1,
                    UnitPrice = products[7].Amount,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new OrderItems
                {
                    OrderId = order2.Id,
                    ProductId = products[3].Id, // USB Hub
                    Quantity = 2,
                    UnitPrice = products[3].Amount,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new OrderItems
                {
                    OrderId = order2.Id,
                    ProductId = products[6].Id, // Webcam
                    Quantity = 1,
                    UnitPrice = products[6].Amount,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                }
            };

            // Create Order Items for Order 3 (Headphones + Cable Kit)
            var orderItems3 = new[]
            {
                new OrderItems
                {
                    OrderId = order3.Id,
                    ProductId = products[4].Id, // Headphones
                    Quantity = 1,
                    UnitPrice = products[4].Amount,
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new OrderItems
                {
                    OrderId = order3.Id,
                    ProductId = products[9].Id, // Cable Management
                    Quantity = 1,
                    UnitPrice = products[9].Amount,
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new OrderItems
                {
                    OrderId = order3.Id,
                    ProductId = products[1].Id, // Mouse
                    Quantity = 1,
                    UnitPrice = products[1].Amount,
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                }
            };

            context.OrderItems.AddRange(orderItems1);
            context.OrderItems.AddRange(orderItems2);
            context.OrderItems.AddRange(orderItems3);
            context.SaveChanges();
        }
    }
}
