using System.ComponentModel.DataAnnotations;

namespace MSTARTTaskDB.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        [Required]
        public string Role { get; set; } = string.Empty;

        public byte[]? photo { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool Status { get; set; }

        public ICollection<Orders> Orders { get; set; } = new List<Orders>();
    }
}