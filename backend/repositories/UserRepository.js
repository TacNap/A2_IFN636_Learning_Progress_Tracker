const BaseUserModel = require('../models/User');
const StudentModel = require('../models/Student');
const EducatorModel = require('../models/Educator');
const Student = require('../domain/Student');
const Educator = require('../domain/Educator');

class UserRepository {
  constructor() {
    this.domainByType = {
      [Student.profileType]: Student,
      [Educator.profileType]: Educator,
    };

    this.modelByType = {
      [Student.profileType]: StudentModel,
      [Educator.profileType]: EducatorModel,
    };
  }

  mapDoc(doc) {
    if (!doc) return null;
    const plain = doc.toObject ? doc.toObject() : doc;
    const profileType = plain.profileType || Student.profileType;
    const Domain = this.domainByType[profileType];
    if (!Domain) {
      throw new Error(`Unknown profile type: ${profileType}`);
    }

    return new Domain({
      id: plain._id ? plain._id.toString() : plain.id,
      name: plain.name,
      email: plain.email,
      university: plain.university,
      address: plain.address,
      profileType,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    });
  }

  getModelForType(profileType = Student.profileType) {
    return this.modelByType[profileType] || StudentModel;
  }

  async createUser({ profileType = Student.profileType, ...data }) {
    const Model = this.getModelForType(profileType);
    const doc = await Model.create({ ...data, profileType: profileType || Student.profileType });
    return this.mapDoc(doc);
  }

  async findByEmail(email) {
    const doc = await BaseUserModel.findOne({ email });
    return this.mapDoc(doc);
  }

  async findById(id) {
    if (!id) return null;
    const doc = await BaseUserModel.findById(id);
    return this.mapDoc(doc);
  }

  async validateCredentials(email, password) {
    const doc = await BaseUserModel.findOne({ email });
    if (!doc) return null;
    const isMatch = await doc.comparePassword(password);
    if (!isMatch) return null;
    return this.mapDoc(doc);
  }

  async updateProfile(id, updates) {
    const doc = await BaseUserModel.findById(id);
    if (!doc) return null;
    const domain = this.mapDoc(doc);
    domain.updateProfile(updates);

    doc.name = domain.name;
    doc.email = domain.email;
    doc.university = domain.university;
    doc.address = domain.address;

    await doc.save();
    return this.mapDoc(doc);
  }
}

module.exports = new UserRepository();

