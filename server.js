require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { sequelize, User, EsmpDistrictUpload } = require('./models');  // ✅ All from models

const app = express();
const PORT = process.env.PORT || 5000;

// =======================================================
// CORS CONFIGURATION
// =======================================================
const allowedOrigins = [
  'http://localhost:3000',                        // local dev
  'https://vertcorps-official-site.netlify.app',  // deployed frontend
  'http://localhost:3001',                        // if you use different port
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin); // Add logging
      callback(new Error('CORS policy: Access denied from this origin'), false);
    }
  },
  credentials: true,
}));

// =======================================================
// MIDDLEWARE
// =======================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================================================
// STATIC FILES (UPLOADS)
// =======================================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// =======================================================
// ROUTES
// =======================================================
const notificationRoutes = require('./routes/notificationRoutes');
const authRoutes = require('./routes/authRoutes');
const esmpRoutes = require('./routes/esmpRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewerRoutes = require('./routes/reviewerRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const districtEsmpRoutes = require('./routes/districtEsmpRoutes');

app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/esmp', esmpRoutes); // optional: namespace routes
app.use('/api/users', userRoutes);
app.use('/api/reviewer', reviewerRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/district', districtEsmpRoutes);

// =======================================================
// HEALTH CHECK
// =======================================================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ESMP Tracker API is running' });
});

// =======================================================
// ESMP FILE UPLOAD
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
    const { esmp_id, district, subproject, coordinates, sector, cycle, funding_component } = req.body;

    if (!req.files || !req.files.length) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const records = req.files.map((file) => ({
      esmp_id,
      district,
      subproject,
      coordinates,
      sector,
      cycle,
      funding_component,
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
// START SERVER
// =======================================================
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('✅ Database synced');
    
    // Auto-create default users if none exist
    const userCount = await User.count();
    console.log(`👥 Users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('🔧 No users found. Creating default users...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await User.bulkCreate([
        {
          name: 'Admin User',
          email: 'admin@vertcorps.com',
          password: hashedPassword,
          role: 'admin',
          district: null
        },
        {
          name: 'District EDO Lilongwe',
          email: 'edo.lilongwe@vertcorps.com',
          password: hashedPassword,
          role: 'district_EDO',
          district: 'Lilongwe'
        },
        {
          name: 'District EDO Blantyre',
          email: 'edo.blantyre@vertcorps.com',
          password: hashedPassword,
          role: 'district_EDO',
          district: 'Blantyre'
        },
        {
          name: 'Reviewer User',
          email: 'reviewer@vertcorps.com',
          password: hashedPassword,
          role: 'reviewer',
          district: null
        }
      ]);
      
      console.log('✅ Default users created!');
      console.log('   📧 admin@vertcorps.com / password123');
      console.log('   📧 edo.lilongwe@vertcorps.com / password123');
      console.log('   📧 edo.blantyre@vertcorps.com / password123');
      console.log('   📧 reviewer@vertcorps.com / password123');
    } else {
      console.log('✅ Users already exist, skipping creation');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database sync failed:', err);
  });


