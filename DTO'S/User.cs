namespace MSTARTTaskDB.DTOs.User
{
    public class UserReadDto
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public string? Phone { get; set; }
        public required string Role { get; set; }
        public bool Status { get; set; }
    }

    public class UserCreateDto
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string Email { get; set; }
        public string? Phone { get; set; }
        public required string Role { get; set; }
    }

    public class UserUpdateDto
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public bool? Status { get; set; }
    }
}
