# MSTART Task DB - E-Commerce Platform

A modern full-stack e-commerce application built with ASP.NET Core 8.0 and React 19.

## 🚀 Features

- **Product Management**: Admin can add, edit, delete products with photos and inventory tracking
- **User Management**: Admin can manage users and roles
- **Shopping Cart**: Add products to cart with quantity management
- **Dark/Light Theme**: Beautiful glassmorphic UI with theme switching
- **Multi-language Support**: English and Arabic translations
- **Authentication**: Secure login system with JWT tokens
- **Image Upload**: Support for product photos stored in database

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/khaleel-99/MSTARTTaskDB.git
cd MSTARTTaskDB/MSTARTTaskDB
```

### 2. Backend Setup

Navigate to the backend directory and restore dependencies:

```bash
cd MSTARTTaskDB
dotnet restore
```

### 3. Database Setup

The application uses SQLite. Initialize the database:

```bash
dotnet ef database update
```

This will create the database with sample data including:
- Default admin user: `admin@example.com` / `Admin123!`
- Default regular user: `user@example.com` / `User123!`
- 10 sample products

### 4. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

## ▶️ Running the Application

### Start Backend Server

From the `MSTARTTaskDB` directory:

```bash
dotnet run
```

The backend will run on: `http://localhost:5037`

### Start Frontend Development Server

From the `MSTARTTaskDB/frontend` directory:

```bash
npm start
```

The frontend will run on: `http://localhost:3000`

## 👤 Default User Accounts

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full product and user management

### Regular User Account
- **Username**: `user`
- **Password**: `user123`
- **Access**: Browse and shop products

## 🗂️ Project Structure

```
MSTARTTaskDB/
├── Controllers/          # API Controllers
├── Data/                 # Database context and initializer
├── DTO'S/               # Data Transfer Objects
├── Models/              # Entity models
├── Services/            # Business logic services
├── Migrations/          # EF Core migrations
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Context providers
│   │   ├── i18n/        # Translations
│   │   └── services/    # API services
│   └── public/          # Static files
├── appsettings.json     # Configuration
└── Program.cs           # Application entry point
```

## 🛠️ Technology Stack

### Backend
- ASP.NET Core 8.0
- Entity Framework Core
- SQLite Database
- JWT Authentication

### Frontend
- React 19.2.1
- CSS Modules
- Context API for state management
- Axios for API calls

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/{id}` - Update product (Admin)
- `DELETE /api/products/{id}` - Delete product (Admin)
- `POST /api/products/{id}/photo` - Upload product photo (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/{id}` - Get user by ID (Admin)
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/{id}` - Update user (Admin)
- `DELETE /api/users/{id}` - Delete user (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order

## 🎨 Features Overview

### For Users
- Browse product catalog
- View product details with images
- Add products to cart
- Adjust quantities in cart
- Dark/Light theme toggle
- Language switching (EN/AR)

### For Admins
- All user features plus:
- Product management (CRUD operations)
- Upload product images
- Manage inventory quantities
- User management (CRUD operations)
- Assign user roles

## 🔒 Security Notes

⚠️ **Important**: This is a demonstration project. For production use:

1. Change default passwords immediately
2. Use environment variables for sensitive data
3. Implement proper CORS policies
4. Add rate limiting
5. Use HTTPS in production
6. Implement proper input validation
7. Add logging and monitoring

## 🐛 Troubleshooting

### Port Already in Use
If port 5037 or 3000 is already in use:

**Backend**: Edit `Properties/launchSettings.json` and change the port
**Frontend**: Set `PORT` environment variable before running `npm start`

### Database Issues
Reset the database:
```bash
dotnet ef database drop
dotnet ef database update
```

### Missing Dependencies
```bash
# Backend
dotnet restore

# Frontend
cd frontend
npm install
```

## 📄 License

This project is for educational/demonstration purposes.

## 👨‍💻 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For issues and questions, please open an issue in the GitHub repository.

---

Made with ❤️ using ASP.NET Core and React
