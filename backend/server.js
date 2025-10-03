const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const educatorRoutes = require('./routes/educatorRoutes');

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/modules', require('./routes/moduleRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/certificates', require('./routes/certificatesRoutes'));
app.use('/api/semesters', require('./routes/semesterRoutes'));
app.use('/api/educator', require('./routes/educatorRoutes'));

if (require.main === module) {
    connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }


module.exports = app
