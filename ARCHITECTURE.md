# Frontend-Backend Connection Architecture

## 📡 Overview

This application uses a **client-server architecture** where:
- **Backend (ASP.NET Core)** runs on `http://localhost:5037`
- **Frontend (React)** runs on `http://localhost:3000`
- Communication happens via **RESTful API** using HTTP requests
- Data is exchanged in **JSON format**

---

## 🔌 How They Connect

### 1. CORS Configuration (Backend)

**File**: `Program.cs`

The backend allows the frontend to make requests using CORS (Cross-Origin Resource Sharing):

```csharp
// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")  // Frontend URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Apply CORS
app.UseCors("AllowReactApp");
```

**What this does**:
- Tells the backend to accept requests from `http://localhost:3000`
- Allows any HTTP method (GET, POST, PUT, DELETE)
- Allows any headers (Authorization, Content-Type, etc.)

---

### 2. API Base URL (Frontend)

**File**: `frontend/src/services/api.js`

The frontend configures the backend URL:

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5037/api',  // Backend API URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add authentication token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
```

**What this does**:
- Creates an Axios instance pointing to the backend
- Automatically adds JWT token to all requests
- Handles authentication headers

---

## 🔄 Request Flow Example

### Example: User Login

#### Step 1: User enters credentials in React form
```javascript
// frontend/src/components/Login.js
const handleLogin = async (e) => {
    e.preventDefault();
    const response = await authService.login(username, password);
    // Store token and user data
};
```

#### Step 2: Frontend calls the auth service
```javascript
// frontend/src/services/authService.js
import api from './api';

export const authService = {
    login: async (username, password) => {
        const response = await api.post('/auth/login', {
            username,
            password
        });
        return response.data;
    }
};
```

**This sends**:
```
POST http://localhost:5037/api/auth/login
Content-Type: application/json

{
    "username": "admin",
    "password": "admin123"
}
```

#### Step 3: Backend receives and processes request
```csharp
// Controllers/AuthController.cs
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
{
    var result = await _authService.Login(loginDto);
    if (result.Success)
    {
        return Ok(new {
            token = result.Token,
            user = result.User
        });
    }
    return Unauthorized();
}
```

#### Step 4: Backend returns response
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "admin",
        "role": "Admin"
    }
}
```

#### Step 5: Frontend stores token and updates UI
```javascript
// Store in localStorage
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.user));

// Update app state
setUser(response.user);
```

---

## 🛠️ Service Layer Architecture

### Frontend Services Structure

```
frontend/src/services/
├── api.js              # Base Axios configuration
├── authService.js      # Login, register, logout
├── productService.js   # Product CRUD operations
└── cartService.js      # Cart management (localStorage)
```

### Example: Product Service

```javascript
// frontend/src/services/productService.js
import api from './api';

export const productService = {
    // GET all products
    getAllProducts: async () => {
        const response = await api.get('/products');
        return response.data;
    },

    // GET single product
    getProductById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // POST create product (Admin only)
    createProduct: async (productData) => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    // PUT update product (Admin only)
    updateProduct: async (id, productData) => {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    // DELETE product (Admin only)
    deleteProduct: async (id) => {
        await api.delete(`/products/${id}`);
    }
};
```

---

## 🔐 Authentication Flow

### 1. Login Process
```
User → Login Form → authService.login() → POST /api/auth/login
                                              ↓
                                         Backend validates
                                              ↓
                                    Generate JWT Token
                                              ↓
                                    Return token + user
                                              ↓
Frontend stores → localStorage.setItem('token', token)
```

### 2. Authenticated Requests
```
User action → Service call → api.js interceptor adds token
                                      ↓
                              Authorization: Bearer {token}
                                      ↓
                            Backend validates token
                                      ↓
                            Return data or 401 Unauthorized
```

### 3. JWT Token Structure
```javascript
// Token is stored in localStorage
const token = localStorage.getItem('token');

// Token is automatically added to headers
headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

---

## 📤 File Upload Example

### Uploading Product Photos

#### Frontend:
```javascript
// Create FormData for file upload
const formData = new FormData();
formData.append('photo', fileInput.files[0]);

// Send with multipart/form-data
await api.post(`/products/${productId}/photo`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
```

#### Backend:
```csharp
[HttpPost("{id}/photo")]
public async Task<IActionResult> UploadPhoto(int id, IFormFile photo)
{
    // Read file to byte array
    using var memoryStream = new MemoryStream();
    await photo.CopyToAsync(memoryStream);
    byte[] photoBytes = memoryStream.ToArray();

    // Store in database
    var product = await _context.Products.FindAsync(id);
    product.Photo = photoBytes;
    await _context.SaveChangesAsync();

    return Ok();
}
```

---

## 🌐 API Endpoints Map

| Frontend Call | HTTP Method | Backend Endpoint | Purpose |
|--------------|-------------|------------------|---------|
| `authService.login()` | POST | `/api/auth/login` | User login |
| `authService.register()` | POST | `/api/auth/register` | User registration |
| `productService.getAllProducts()` | GET | `/api/products` | Get all products |
| `productService.getProductById(id)` | GET | `/api/products/{id}` | Get single product |
| `productService.createProduct()` | POST | `/api/products` | Create product |
| `productService.updateProduct(id)` | PUT | `/api/products/{id}` | Update product |
| `productService.deleteProduct(id)` | DELETE | `/api/products/{id}` | Delete product |
| `userService.getAllUsers()` | GET | `/api/users` | Get all users (Admin) |
| `orderService.createOrder()` | POST | `/api/orders` | Create order |

---

## ⚙️ Configuration for Different Environments

### Development (Current Setup)
```javascript
// frontend/src/services/api.js
baseURL: 'http://localhost:5037/api'
```

### Production Deployment

#### Option 1: Same Server
```javascript
// Use relative URL
baseURL: '/api'
```

```csharp
// Serve React build from ASP.NET Core
app.UseStaticFiles();
app.MapFallbackToFile("index.html");
```

#### Option 2: Different Servers
```javascript
// Use environment variable
baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5037/api'
```

```bash
# .env.production
REACT_APP_API_URL=https://api.yourcompany.com/api
```

```csharp
// Update CORS for production
policy.WithOrigins("https://yourcompany.com")
```

---

## 🔍 Debugging Connection Issues

### Check if Backend is Running
```bash
curl http://localhost:5037/api/products
```

### Check if Frontend can reach Backend
```javascript
// In browser console
fetch('http://localhost:5037/api/products')
    .then(res => res.json())
    .then(data => console.log(data));
```

### Common Issues

#### 1. CORS Error
```
Access to fetch at 'http://localhost:5037/api/products' from origin 
'http://localhost:3000' has been blocked by CORS policy
```
**Solution**: Check CORS configuration in `Program.cs`

#### 2. Network Error
```
Network Error / Failed to fetch
```
**Solution**: Backend is not running or wrong URL

#### 3. 401 Unauthorized
```
Request failed with status code 401
```
**Solution**: Token expired or missing, user needs to login again

#### 4. 404 Not Found
```
Request failed with status code 404
```
**Solution**: Wrong endpoint URL or controller route

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                   REACT FRONTEND                             │
│                 (localhost:3000)                             │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Components  │ → │   Services   │ → │    api.js    │  │
│  │              │    │              │    │  (Axios)     │  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘  │
└─────────────────────────────────────────────────┼───────────┘
                                                   │
                                    HTTP Request   │
                                    (JSON)         │
                                                   ↓
┌─────────────────────────────────────────────────┼───────────┐
│                   ASP.NET CORE BACKEND           │           │
│                 (localhost:5037)                 │           │
│                                                  ↓           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │    CORS      │ → │ Controllers  │ → │   Services   │  │
│  │   Middleware │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘  │
│                                                   │          │
│                                                   ↓          │
│                                            ┌──────────────┐  │
│                                            │   Database   │  │
│                                            │   (SQLite)   │  │
│                                            └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Scenarios

### Scenario 1: Separate Deployments
- **Frontend**: Netlify, Vercel, or AWS S3
- **Backend**: Azure, AWS, or DigitalOcean
- **Connection**: Frontend calls Backend API via public URL

### Scenario 2: Single Server
- **Build React**: `npm run build`
- **Serve from ASP.NET**: Configure static files
- **Deploy**: Single application to server

### Scenario 3: Docker Containers
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./MSTARTTaskDB
    ports:
      - "5037:5037"
  
  frontend:
    build: ./MSTARTTaskDB/frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://backend:5037/api
```

---

## 📝 Best Practices

1. **Environment Variables**: Never hardcode URLs
2. **Error Handling**: Always handle network errors gracefully
3. **Loading States**: Show loading indicators during API calls
4. **Token Refresh**: Implement token refresh mechanism
5. **API Versioning**: Use `/api/v1/` for future compatibility
6. **Rate Limiting**: Implement rate limiting on backend
7. **Validation**: Validate on both frontend and backend
8. **HTTPS**: Always use HTTPS in production

---

This document explains the complete connection architecture between frontend and backend!
