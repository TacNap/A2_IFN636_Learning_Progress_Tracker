const mongoose = require('mongoose');
const BaseUser = require('./User');

const studentSchema = new mongoose.Schema({}, { _id: false });

module.exports = BaseUser.discriminator('student', studentSchema);

