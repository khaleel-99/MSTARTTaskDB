using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSTARTTaskDB.Data;
using MSTARTTaskDB.DTO_S;
using MSTARTTaskDB.Services;
using System.Security.Claims;

namespace MSTARTTaskDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuthService _authService;

        public ProfileController(ApplicationDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        // GET: api/profile
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                email = user.Email,
                phone = user.Phone,
                role = user.Role,
                photo = user.photo != null ? Convert.ToBase64String(user.photo) : null,
                createdAt = user.CreatedAt
            });
        }

        // PUT: api/profile
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Check if username is being changed and if it's already taken
            if (!string.IsNullOrEmpty(dto.Username) && dto.Username != user.Username)
            {
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == dto.Username);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Username already taken" });
                }
                user.Username = dto.Username;
            }

            // Check if email is being changed and if it's already taken
            if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Email)
            {
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == dto.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Email already taken" });
                }
                user.Email = dto.Email;
            }

            if (!string.IsNullOrEmpty(dto.Phone))
            {
                user.Phone = dto.Phone;
            }

            // Update password if both current and new password are provided
            if (!string.IsNullOrEmpty(dto.CurrentPassword) && !string.IsNullOrEmpty(dto.NewPassword))
            {
                if (!_authService.VerifyPassword(dto.CurrentPassword, user.Password))
                {
                    return BadRequest(new { message = "Current password is incorrect" });
                }
                user.Password = _authService.HashPassword(dto.NewPassword);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }

        // POST: api/profile/photo
        [HttpPost("photo")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadPhoto(IFormFile photo)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (photo == null || photo.Length == 0)
            {
                return BadRequest(new { message = "No photo provided" });
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
            if (!allowedTypes.Contains(photo.ContentType.ToLower()))
            {
                return BadRequest(new { message = "Only image files (JPEG, PNG, GIF) are allowed" });
            }

            // Validate file size (max 5MB)
            if (photo.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { message = "Photo size cannot exceed 5MB" });
            }

            using (var memoryStream = new MemoryStream())
            {
                await photo.CopyToAsync(memoryStream);
                user.photo = memoryStream.ToArray();
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Photo uploaded successfully",
                photo = Convert.ToBase64String(user.photo)
            });
        }

        // DELETE: api/profile/photo
        [HttpDelete("photo")]
        public async Task<IActionResult> DeletePhoto()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.photo = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Photo deleted successfully" });
        }
    }
}
