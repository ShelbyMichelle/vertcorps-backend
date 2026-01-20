require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// =======================================================
// MIDDLEWARE
// =======================================================
app.use(cors({
  origin: [
    'http://localhost:3000', // add your local dev frontend
    'https://vertcorps-esmp-files.netlify.app' // your deployed frontend
  ],
  credentials: true // if you are sending cookies
}));
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
// Sequelize
// =======================================================
const sequelize = require('./database');
const { User, EsmpDistrictUpload } = require('./models');

// =======================================================
// ROUTES
// =======================================================
const notificationRoutes = require('./routes/notificationRoutes');
const authRoutes = require('./routes/authRoutes');
// const reviewerRoutes = require('./routes/reviewerRoutes');
const esmpRoutes = require('./routes/esmpRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use("/api", esmpRoutes)
// app.use('/api/esmp', esmpRoutes);
// app.use('/api/reviewer', reviewerRoutes);
app.use('/api/statistics', require('./routes/statisticsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
// app.use('/api/district/esmp', require('./routes/districtEsmpRoutes'));
app.use('/api/district', require('./routes/districtEsmpRoutes'));
app.use('/api/users', userRoutes);
const reviewerRoutes = require('./routes/reviewerRoutes');
app.use('/api/reviewer', reviewerRoutes);
app.use('/api', userRoutes);



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
    const {
      esmp_id,
      district,
      subproject,
      coordinates,
      sector,
      cycle,
      funding_component,
    } = req.body;

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
// FETCH ALL ESMPs
// =======================================================
app.get('/api/esmp/list', async (req, res) => {
  try {
    const esmpList = await EsmpDistrictUpload.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: esmpList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
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
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database sync failed:', err);
  });

