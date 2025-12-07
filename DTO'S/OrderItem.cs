namespace MSTARTTaskDB.DTOs.OrderItem
{
    public class OrderItemReadDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class OrderItemCreateDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class OrderItemUpdateDto
    {
        public int? Quantity { get; set; }
    }
}
