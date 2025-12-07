using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using MSTARTTaskDB.Data;
using MSTARTTaskDB.Models;
using MSTARTTaskDB.DTOs.Order;

namespace MSTARTTaskDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderReadDto>>> GetOrders()
        {
            var userRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            var userId = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            IQueryable<Orders> query = _context.Orders;

            // If user is not admin, filter to show only their orders
            if (userRole != "Admin" && !string.IsNullOrEmpty(userId))
            {
                var userIdInt = int.Parse(userId);
                query = query.Where(o => o.UserId == userIdInt);
            }

            var orders = await query
                .Select(o => new OrderReadDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    Currency = o.Currency,
                    CreatedAt = o.CreatedAt
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            // Check if user is admin or order owner
            var userRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            var userId = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (userRole != "Admin" && !string.IsNullOrEmpty(userId))
            {
                var userIdInt = int.Parse(userId);
                if (order.UserId != userIdInt)
                {
                    return Forbid();
                }
            }

            var orderDto = new
            {
                order.Id,
                order.UserId,
                order.TotalAmount,
                order.Status,
                order.Currency,
                order.CreatedAt,
                Items = order.OrderItems.Select(oi => new
                {
                    oi.Id,
                    oi.ProductId,
                    ProductName = oi.Product?.Name,
                    oi.Quantity,
                    oi.UnitPrice,
                    Subtotal = oi.Quantity * oi.UnitPrice
                })
            };

            return Ok(orderDto);
        }

        [HttpPost]
        public async Task<ActionResult<OrderReadDto>> CreateOrder(OrderCreateDto orderDto)
        {
            // Get current user ID from token
            var userId = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userIdInt = int.Parse(userId);
            var user = await _context.Users.FindAsync(userIdInt);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            var productIds = orderDto.Items.Select(i => i.ProductId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, p => p);

            foreach (var item in orderDto.Items)
            {
                if (!products.ContainsKey(item.ProductId))
                {
                    return BadRequest(new { message = $"Product {item.ProductId} not found" });
                }

                if (item.Quantity <= 0)
                {
                    return BadRequest(new { message = "Quantity must be greater than 0" });
                }
            }

            var order = new Orders
            {
                UserId = userIdInt,
                Status = "Pending",
                Currency = products.First().Value.Currency,
                CreatedAt = DateTime.Now,
                TotalAmount = 0
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            decimal totalAmount = 0;
            foreach (var itemDto in orderDto.Items)
            {
                var product = products[itemDto.ProductId];
                var orderItem = new OrderItems
                {
                    OrderId = order.Id,
                    ProductId = itemDto.ProductId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = product.Amount,
                    CreatedAt = DateTime.Now
                };

                totalAmount += orderItem.Quantity * orderItem.UnitPrice;
                _context.OrderItems.Add(orderItem);
            }

            order.TotalAmount = totalAmount;
            await _context.SaveChangesAsync();

            var readDto = new OrderReadDto
            {
                Id = order.Id,
                UserId = order.UserId,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                Currency = order.Currency,
                CreatedAt = order.CreatedAt
            };

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, readDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, OrderUpdateDto orderDto)
        {
            var order = await _context.Orders.FindAsync(id);

            if (order == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(orderDto.Status))
            {
                var validStatuses = new[] { "Pending", "Processing", "Completed", "Cancelled" };
                if (!validStatuses.Contains(orderDto.Status))
                {
                    return BadRequest(new { message = "Invalid status" });
                }
                order.Status = orderDto.Status;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            _context.OrderItems.RemoveRange(order.OrderItems);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
