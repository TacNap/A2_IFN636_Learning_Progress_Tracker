const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const baseOptions = {
  discriminatorKey: 'profileType',
  timestamps: true,
};

const baseUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    university: { type: String },
    address: { type: String },
  },
  baseOptions
);

baseUserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

baseUserSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const BaseUser = mongoose.model('User', baseUserSchema);

module.exports = BaseUser;

