using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using MSTARTTaskDB.Data;
using MSTARTTaskDB.Models;
using MSTARTTaskDB.DTOs.User;
using MSTARTTaskDB.Services;

namespace MSTARTTaskDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuthService _authService;

        public UsersController(ApplicationDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserReadDto>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserReadDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Phone = u.Phone,
                    Role = u.Role,
                    Status = u.Status
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserReadDto>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserReadDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role,
                Status = user.Status
            };

            return Ok(userDto);
        }

        [HttpPost]
        public async Task<ActionResult<UserReadDto>> CreateUser(UserCreateDto userDto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == userDto.Username))
            {
                return BadRequest(new { message = "Username exists" });
            }

            if (await _context.Users.AnyAsync(u => u.Email == userDto.Email))
            {
                return BadRequest(new { message = "Email exists" });
            }

            var user = new User
            {
                Username = userDto.Username,
                Password = _authService.HashPassword(userDto.Password),
                Email = userDto.Email,
                Phone = userDto.Phone,
                Role = userDto.Role,
                Status = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var readDto = new UserReadDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role,
                Status = user.Status
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, readDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserUpdateDto userDto)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(userDto.Username))
            {
                if (await _context.Users.AnyAsync(u => u.Username == userDto.Username && u.Id != id))
                {
                    return BadRequest(new { message = "Username exists" });
                }
                user.Username = userDto.Username;
            }

            if (!string.IsNullOrEmpty(userDto.Email))
            {
                if (await _context.Users.AnyAsync(u => u.Email == userDto.Email && u.Id != id))
                {
                    return BadRequest(new { message = "Email exists" });
                }
                user.Email = userDto.Email;
            }

            if (!string.IsNullOrEmpty(userDto.Password))
            {
                user.Password = _authService.HashPassword(userDto.Password);
            }

            if (userDto.Phone != null)
            {
                user.Phone = userDto.Phone;
            }

            if (userDto.Status.HasValue)
            {
                user.Status = userDto.Status.Value;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
