namespace MSTARTTaskDB.Services
{
    public interface IAuthService
    {
        string GenerateToken(string userId, string username, string role);
        string HashPassword(string password);
        bool VerifyPassword(string password, string storedHash);
    }
}
