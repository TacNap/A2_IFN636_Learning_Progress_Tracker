const mongoose = require('mongoose');
const BaseUser = require('./User');

const educatorSchema = new mongoose.Schema({}, { _id: false });

module.exports = BaseUser.discriminator('educator', educatorSchema);

