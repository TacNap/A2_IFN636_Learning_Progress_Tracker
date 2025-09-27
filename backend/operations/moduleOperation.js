const BaseOperation = require('./baseOperation');
const Module = require('../models/Module');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

class ModuleOperation extends BaseOperation {
  get model() {
    return Module;
  }

  async createModule(data) {
    return super.create(data);
  }

  async getModules(filter = {}) {
    return super.list(filter);
  }

  async GetModuleById(id) {
    return super.getById(id);
  }

  async UpdateModule(id, data) {
    const { doc, meta } = await super.updateById(id, data);
    if (!doc) return null;
    return { module: doc, certificateEarned: !!meta.certificateEarned };
  }

  // Hooks
  async beforeCreate(data) {
    const { userId, title, description, deadline, totalLessons } = data || {};

    this.ensureProvided('userId', userId);
    this.ensureProvided('title', title);

    let tl = 0;
    if (totalLessons !== undefined) {
      tl = this.parseNonNegativeInt('Total lessons', totalLessons);
    }

    return {
      userId,
      title,
      description,
      deadline,
      totalLessons: tl,
      completedLessons: 0,
    };
  }

  async beforeUpdate(module, data) {
    const { title, description, completed, deadline, totalLessons, completedLessons } = data || {};

    module.title = title || module.title;
    module.description = description || module.description;
    module.completed = completed ?? module.completed;
    module.deadline = deadline || module.deadline;

    if (totalLessons !== undefined) {
      const parsedTotal = this.parseNonNegativeInt('Total lessons', totalLessons);
      module.totalLessons = parsedTotal;
      if (module.completedLessons > parsedTotal) {
        module.completedLessons = parsedTotal;
      }
    }

    if (completedLessons !== undefined) {
      const parsedCompleted = this.parseNonNegativeInt('Completed lessons', completedLessons);
      module.completedLessons = parsedCompleted;
    }
  }

  async afterUpdate(updatedModule, prev) {
    const res = await this.handleCertificateCreation(
      updatedModule,
      prev.completedLessons,
      updatedModule.completedLessons
    );
    return { certificateEarned: res.certificateEarned };
  }

  async handleCertificateCreation(module, previousCompletedLessons, newCompletedLessons) {
    let certificateEarned = false;
    try {
      const { totalLessons } = module;
      if (
        previousCompletedLessons < totalLessons &&
        newCompletedLessons === totalLessons &&
        totalLessons > 0
      ) {
        const user = await User.findById(module.userId);
        if (user) {
          const existingCertificate = await Certificate.findOne({
            userId: user._id,
            moduleId: module._id,
          });
          if (!existingCertificate) {
            await Certificate.create({
              userId: user._id,
              moduleId: module._id,
              moduleName: module.title,
              userName: user.name,
              totalLessons: module.totalLessons,
            });
            certificateEarned = true;
          }
        }
      }
    } catch (error) {
      console.error('Error creating certificate:', error);
    }
    return { certificateEarned };
  } 
}

module.exports = new ModuleOperation();
