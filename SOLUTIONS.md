# Solutions Guide for Instructors 🔑

This document outlines the 8 major conceptual issues and their solutions.

## 🚨 Issues and Solutions

### 1. **Middleware Order Problem** (index.js)

#### Issue: CORS middleware applied after JSON parsing
```javascript
// WRONG
app.use(express.json());
app.use(cors());

// CORRECT
app.use(cors());
app.use(express.json());
```

### 2. **Hardcoded Database Configuration** (index.js, config.js)

#### Issue: MongoDB URL and secrets hardcoded
```javascript
// WRONG
const mongoUrl = "mongodb://localhost:27017/studentpractice";

// CORRECT
const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017/studentpractice";
```

### 3. **Missing Global Error Handling** (index.js)

#### Issue: No global error handling middleware
```javascript
// ADD THIS at the end before app.listen()
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});
```

### 4. **Incomplete Authentication Middleware** (middlewares/auth.js)

#### Issue: Missing error handling and token validation
```javascript
// CORRECT VERSION
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
```

### 5. **Inadequate Schema Validation** (models/User.js)

#### Issue: Missing validation constraints
```javascript
// CORRECT VERSION
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  age: {
    type: Number,
    min: [13, 'Age must be at least 13'],
    max: [120, 'Age must be less than 120']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  }
}, {
  timestamps: true
});
```

### 6. **Missing Input Validation** (middlewares/validation.js)

#### Issue: Incomplete validation logic
```javascript
// CORRECT VERSION
const validateUser = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];
  
  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Please provide a valid email');
  }
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];
  
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};
```

### 7. **Insecure Authentication Flow** (routes/authRoutes.js)

#### Issue: Missing user checks and data exposure
```javascript
// CORRECT REGISTER
router.post('/register', validateUser, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }
    
    const user = new User({ username, email, password });
    await user.save();
    
    // Don't return password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// CORRECT LOGIN
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Don't return password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

### 8. **Missing Route Protection** (routes/userRoutes.js)

#### Issue: No authentication on sensitive endpoints
```javascript
// CORRECT VERSION with authentication
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user can delete (authorization)
    if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

## 🎯 **Environment Variables Setup**

Create `.env` file:
```env
MONGODB_URL=mongodb://localhost:27017/studentpractice
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
PORT=3000
```

## 📊 **Assessment Criteria**

- **🟢 Basic (Issues 1-3)**: Configuration and middleware setup
- **🟡 Intermediate (Issues 4-6)**: Security and validation implementation  
- **🔴 Advanced (Issues 7-8)**: Authentication flow and authorization
