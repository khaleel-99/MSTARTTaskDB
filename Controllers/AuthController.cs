using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSTARTTaskDB.Data;
using MSTARTTaskDB.DTOs;
using MSTARTTaskDB.Services;

namespace MSTARTTaskDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuthService _authService;

        public AuthController(ApplicationDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !_authService.VerifyPassword(loginDto.Password, user.Password))
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            if (!user.Status)
            {
                return Unauthorized(new { message = "User account is inactive" });
            }

            var token = _authService.GenerateToken(user.Id.ToString(), user.Username, user.Role);

            return Ok(new LoginResponseDto
            {
                Token = token,
                Username = user.Username,
                Role = user.Role
            });
        }
    }
}
