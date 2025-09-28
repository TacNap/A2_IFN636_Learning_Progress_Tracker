const BaseOperation = require('./baseOperation');
const Certificate = require('../models/Certificate');
const Module = require('../models/Module');
const User = require('../models/User');

class CertificateOperation extends BaseOperation {
  get model() {
    return Certificate;
  }

  async getCertificates(filter = {}, options = {}) {
    const { includeModule = true, sortByCompletionDate = true } = options;
    let query = this.model.find(filter);
    if (includeModule) {
      query = query.populate('moduleId', 'title description');
    }
    if (sortByCompletionDate) {
      query = query.sort({ completionDate: -1 });
    }
    return query.exec();
  }

  async getCertificatesForUser(userId, options = {}) {
    this.ensureProvided('userId', userId);
    return this.getCertificates({ userId }, options);
  }

  async createCertificateForModule(userId, moduleId) {
    return super.create({ userId, moduleId });
  }

  async beforeCreate(data) {
    const { userId, moduleId } = data || {};
    this.ensureProvided('userId', userId);
    this.ensureProvided('moduleId', moduleId);

    const [module, user, existingCertificate] = await Promise.all([
      Module.findById(moduleId),
      User.findById(userId),
      Certificate.findOne({ userId, moduleId }),
    ]);

    if (!module) {
      throw this.validationError('Module not found.');
    }
    if (!user) {
      throw this.validationError('User not found.');
    }
    if (module.totalLessons <= 0) {
      throw this.validationError('Module must have at least one lesson to award a certificate.');
    }
    if (module.completedLessons < module.totalLessons) {
      throw this.validationError('Module is not completed.');
    }
    if (existingCertificate) {
      throw this.validationError('Certificate already issued for this module.');
    }

    return {
      userId: user._id,
      moduleId: module._id,
      moduleName: module.title,
      userName: user.name,
      totalLessons: module.totalLessons,
    };
  }

  async deleteCertificateById(id, userId) {
    const certificate = await this.model.findById(id);
    if (!certificate) {
      return { deleted: false, reason: 'not_found' };
    }
    if (userId !== undefined && !this.assertOwner(certificate, userId)) {
      return { deleted: false, reason: 'forbidden' };
    }
    await certificate.deleteOne();
    return { deleted: true, certificate };
  }

  async deleteCertificatesByModule(moduleId) {
    this.ensureProvided('moduleId', moduleId);
    const result = await this.model.deleteMany({ moduleId });
    return { deletedCount: result.deletedCount || 0 };
  }
}

module.exports = new CertificateOperation();
