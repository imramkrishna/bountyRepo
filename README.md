# Backend Practice Repository - Find and Fix Issues! 🐛

This repository contains a Node.js/Express backend with **intentional issues** for students to practice debugging and improving code quality.

## 🎯 Learning Objectives

Students will practice:
- Identifying security vulnerabilities
- Implementing proper error handling
- Adding input validation
- Setting up middleware correctly
- Database connection best practices
- Environment variable management

## 🏗️ Project Structure

```
bountyRepo/
├── index.js              # Main server file
├── package.json          # Dependencies
├── .env.example          # Environment variables template
├── config/
│   └── config.js         # Configuration file
├── middlewares/
│   ├── auth.js           # Authentication middleware
│   ├── validation.js     # Input validation middleware
│   └── logger.js         # Logging middleware
├── models/
│   └── User.js           # User model
└── routes/
    ├── userRoutes.js     # User CRUD operations
    └── authRoutes.js     # Authentication routes
```

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd bountyRepo
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your actual values
```

4. **Start MongoDB** (make sure MongoDB is running on your system)

5. **Run the server**
```bash
npm run dev
```

## 🐛 Issues to Find and Fix

### **Major Conceptual Issues:**

#### 1. **Security Vulnerabilities**
- [ ] Hardcoded secrets and configuration
- [ ] Missing password hashing in some places
- [ ] Exposing sensitive data in API responses
- [ ] Missing authentication/authorization checks
- [ ] JWT token handling issues

#### 2. **Middleware Problems**
- [ ] Incorrect middleware order
- [ ] Missing global error handling
- [ ] Incomplete validation logic
- [ ] Authentication middleware bugs

#### 3. **Database Issues**
- [ ] Missing proper MongoDB connection configuration
- [ ] Inadequate schema validation
- [ ] No proper error handling for database operations
- [ ] Missing indexes and constraints

#### 4. **API Design Problems**
- [ ] Missing input validation
- [ ] No proper HTTP status codes
- [ ] Missing pagination
- [ ] Poor error responses
- [ ] No rate limiting

## 🔧 API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Login user

### Users
- `GET /users` - Get all users
- `POST /users` - Create a new user
- `GET /users/:id` - Get user by ID
- `DELETE /users/:id` - Delete user

## 📋 Exercise Instructions

1. **Start by running the server** and testing the endpoints
2. **Identify the issues** by reading through the code
3. **Create a list** of all problems you find
4. **Fix them one by one** and test your solutions
5. **Document your fixes** and explain why they were necessary

## 🎓 Learning Resources

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

## 🏆 Challenge Levels

### Beginner
- Fix hardcoded values
- Add basic validation
- Implement proper error handling

### Intermediate
- Secure authentication flow
- Add comprehensive middleware
- Implement proper MongoDB connection

### Advanced
- Add rate limiting
- Implement proper logging
- Add comprehensive testing
- Set up proper development/production configurations

## 📝 Notes for Instructors

This repository is designed to teach common backend development pitfalls. Each issue represents a real-world problem that developers frequently encounter. The issues range from beginner-friendly to more advanced concepts.

Good luck debugging! 🚀
