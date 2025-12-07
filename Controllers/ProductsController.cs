using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using MSTARTTaskDB.Data;
using MSTARTTaskDB.Models;
using MSTARTTaskDB.DTOs.Product;

namespace MSTARTTaskDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ProductReadDto>>> GetProducts()
        {
            var products = await _context.Products
                .Select(p => new ProductReadDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Amount = p.Amount,
                    Currency = p.Currency,
                    Status = p.Status,
                    Photo = p.Photo != null ? Convert.ToBase64String(p.Photo) : null,
                    Quantity = p.Quantity
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProductReadDto>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound();
            }

            var productDto = new ProductReadDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Amount = product.Amount,
                Currency = product.Currency,
                Status = product.Status,
                Photo = product.Photo != null ? Convert.ToBase64String(product.Photo) : null,
                Quantity = product.Quantity
            };

            return Ok(productDto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductReadDto>> CreateProduct(ProductCreateDto productDto)
        {
            var product = new Products
            {
                Name = productDto.Name,
                Description = productDto.Description,
                Amount = productDto.Amount,
                Currency = productDto.Currency,
                Status = productDto.Status,
                Quantity = productDto.Quantity,
                CreatedAt = DateTime.Now
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var readDto = new ProductReadDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Amount = product.Amount,
                Currency = product.Currency,
                Status = product.Status
            };

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, readDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct(int id, ProductUpdateDto productDto)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(productDto.Name))
            {
                product.Name = productDto.Name;
            }

            if (productDto.Description != null)
            {
                product.Description = productDto.Description;
            }

            if (productDto.Amount.HasValue)
            {
                product.Amount = productDto.Amount.Value;
            }

            if (!string.IsNullOrEmpty(productDto.Currency))
            {
                product.Currency = productDto.Currency;
            }

            if (!string.IsNullOrEmpty(productDto.Status))
            {
                product.Status = productDto.Status;
            }

            if (productDto.Quantity.HasValue)
            {
                product.Quantity = productDto.Quantity.Value;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/photo")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProductPhoto(int id, IFormFile photo)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            if (photo == null || photo.Length == 0)
            {
                return BadRequest(new { message = "No photo provided" });
            }

            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(photo.ContentType.ToLower()))
            {
                return BadRequest(new { message = "Only image files are allowed" });
            }

            if (photo.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { message = "Photo size cannot exceed 5MB" });
            }

            using (var memoryStream = new MemoryStream())
            {
                await photo.CopyToAsync(memoryStream);
                product.Photo = memoryStream.ToArray();
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Photo uploaded successfully", photo = Convert.ToBase64String(product.Photo) });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
