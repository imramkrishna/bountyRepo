# Solutions Guide for Instructors 🔑

This document outlines all the intentional issues in the codebase and their solutions.

## 🚨 Issues and Solutions

### 1. **index.js Issues**

#### Issue: Middleware Order
```javascript
// WRONG
app.use(express.json());
app.use(cors());

// CORRECT
app.use(cors());
app.use(express.json());
```

#### Issue: Hardcoded MongoDB URL
```javascript
// WRONG
const mongoUrl = "mongodb://localhost:27017/studentpractice";

// CORRECT
const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017/studentpractice";
```

#### Issue: Missing Error Handling Middleware
```javascript
// ADD THIS
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
```

#### Issue: Missing Route Prefixes
```javascript
// WRONG
app.use(userRoutes);
app.use(authRoutes);

// CORRECT
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
```

### 2. **User Model Issues**

#### Issue: Missing Validation
```javascript
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

#### Issue: Missing Password Hashing Middleware
```javascript
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
```

### 3. **Authentication Middleware Issues**

#### Issue: Missing Token Validation
```javascript
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

### 4. **Validation Middleware Issues**

#### Issue: Incomplete Validation
```javascript
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

### 5. **User Routes Issues**

#### Issue: Missing Pagination and Security
```javascript
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .select('-password') // Exclude password
      .skip(skip)
      .limit(limit);
      
    const total = await User.countDocuments();
    
    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

### 6. **Auth Routes Issues**

#### Issue: Missing User Existence Check
```javascript
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
```

#### Issue: JWT and Login Issues
```javascript
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
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
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

## 📊 Difficulty Levels

- **🟢 Beginner (1-2)**: Basic fixes like hardcoded values, missing required fields
- **🟡 Intermediate (3-4)**: Middleware issues, validation logic, error handling
- **🔴 Advanced (5-6)**: Security issues, proper authentication flow, database optimization

## 🎯 Assessment Criteria

- **Code Quality**: Clean, readable, and well-structured code
- **Security**: Proper handling of sensitive data and authentication
- **Error Handling**: Comprehensive error catching and user-friendly messages
- **Best Practices**: Following Node.js and Express.js conventions
- **Testing**: Ability to test the fixes and verify they work correctly
