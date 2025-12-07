using System.ComponentModel.DataAnnotations;

namespace MSTARTTaskDB.Models
{
    public class Products
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public string Currency { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = string.Empty;

        public byte[]? Photo { get; set; }

        public int Quantity { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<OrderItems> OrderItems { get; set; } = new List<OrderItems>();
    }
}
