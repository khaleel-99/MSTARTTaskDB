using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using MSTARTTaskDB.Data;
using MSTARTTaskDB.Models;
using MSTARTTaskDB.DTOs.OrderItem;

namespace MSTARTTaskDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderItemsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderItemReadDto>>> GetOrderItems()
        {
            var items = await _context.OrderItems
                .Select(oi => new OrderItemReadDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderItemReadDto>> GetOrderItem(int id)
        {
            var item = await _context.OrderItems.FindAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            var itemDto = new OrderItemReadDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            };

            return Ok(itemDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrderItem(int id, OrderItemUpdateDto itemDto)
        {
            var item = await _context.OrderItems.FindAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            if (itemDto.Quantity.HasValue)
            {
                if (itemDto.Quantity.Value <= 0)
                {
                    return BadRequest(new { message = "Quantity must be greater than 0" });
                }
                item.Quantity = itemDto.Quantity.Value;
            }

            await _context.SaveChangesAsync();

            var order = await _context.Orders.FindAsync(item.OrderId);
            if (order != null)
            {
                var orderItems = await _context.OrderItems.Where(oi => oi.OrderId == order.Id).ToListAsync();
                order.TotalAmount = orderItems.Sum(oi => oi.Quantity * oi.UnitPrice);
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderItem(int id)
        {
            var item = await _context.OrderItems.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            var orderId = item.OrderId;
            _context.OrderItems.Remove(item);
            await _context.SaveChangesAsync();

            var order = await _context.Orders.FindAsync(orderId);
            if (order != null)
            {
                var orderItems = await _context.OrderItems.Where(oi => oi.OrderId == orderId).ToListAsync();
                order.TotalAmount = orderItems.Sum(oi => oi.Quantity * oi.UnitPrice);
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }
    }
}
