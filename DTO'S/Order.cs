using MSTARTTaskDB.DTOs.OrderItem;

namespace MSTARTTaskDB.DTOs.Order
{
    public class OrderReadDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public decimal TotalAmount { get; set; }
        public required string Status { get; set; }
        public required string Currency { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class OrderCreateDto
    {
        public int UserId { get; set; }
        public required List<OrderItemCreateDto> Items { get; set; }
    }

    public class OrderUpdateDto
    {
        public string? Status { get; set; }
    }
}
