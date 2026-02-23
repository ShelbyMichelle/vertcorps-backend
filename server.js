require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');

const { sequelize, User, EsmpDistrictUpload } = require('./models');

// =======================================================
// APP & SERVER SETUP
// =======================================================
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// =======================================================
// SOCKET.IO SETUP
// =======================================================
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://vertcorps-official-site.netlify.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// expose io via a tiny service so models/hooks can emit events
const socketService = require('./services/socket');
socketService.setIO(io);

io.on('connection', (socket) => {
  const { userId, role } = socket.handshake.auth;

  console.log('🔌 New socket connection:', { socketId: socket.id, auth: socket.handshake.auth });

  if (!userId) {
    console.log('❌ Socket connection rejected (no userId)');
    return socket.disconnect();
  }

  socket.join(`user_${userId}`);
  console.log(`🔌 User ${userId} connected via socket (${role}) — socketId: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 User ${userId} disconnected`);
  });
});

// 🔔 Make io accessible in routes (VERY IMPORTANT)
app.set('io', io);

// =======================================================
// CORS CONFIGURATION
// =======================================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://localhost:5173',
  'https://vertcorps-official-site.netlify.app',
  'https://vertcorps-backend-2.onrender.com',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('CORS policy blocked this origin'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// =======================================================
// MIDDLEWARE
// =======================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================================================
// STATIC FILES
// =======================================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// =======================================================
// ROUTES
// =======================================================
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/esmp', require('./routes/esmpRoutes'));
app.use('/api/esmps', require('./routes/esmpRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reviewer', require('./routes/reviewerRoutes'));
app.use('/api/statistics', require('./routes/statisticsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/district', require('./routes/districtEsmpRoutes'));

// =======================================================
// HEALTH CHECK
// =======================================================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ESMP Tracker API is running' });
});

// =======================================================
// FILE UPLOAD
// =======================================================
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  },
});

app.post('/api/esmp/upload', upload.array('files'), async (req, res) => {
  try {
    const records = req.files.map((file) => ({
      ...req.body,
      file_name: file.originalname,
      file_path: file.path,
    }));

    await EsmpDistrictUpload.bulkCreate(records);

    res.json({ success: true, message: '✅ ESMP uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload error' });
  }
});

// =======================================================
// ERROR HANDLER
// =======================================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
});

// =======================================================
// START SERVER (IMPORTANT)
// =======================================================
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('✅ Database synced');

    const userCount = await User.count();
    console.log(`👥 Users in database: ${userCount}`);

    if (userCount === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);

      await User.bulkCreate([
        { name: 'Admin User', email: 'admin@vertcorps.com', password: hashedPassword, role: 'admin' },
        { name: 'District EDO Lilongwe', email: 'edo.lilongwe@vertcorps.com', password: hashedPassword, role: 'district_EDO', district: 'Lilongwe' },
        { name: 'District EDO Blantyre', email: 'edo.blantyre@vertcorps.com', password: hashedPassword, role: 'district_EDO', district: 'Blantyre' },
        { name: 'Reviewer User', email: 'reviewer@vertcorps.com', password: hashedPassword, role: 'reviewer' },
      ]);

      console.log('✅ Default users created');
    }

    // 🚀 IMPORTANT: Use server.listen (not app.listen)
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database sync failed:', err);
  });