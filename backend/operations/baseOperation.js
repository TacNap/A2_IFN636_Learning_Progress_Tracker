// operations layer for modules, assignments, certs and semesters. keeps the controllers nice and boring
class BaseOperation {
  constructor() {
    if (new.target === BaseOperation) {
      throw new Error('BaseOperation is abstract and cannot be instantiated directly');
    }
  }

  // Subclasses must override to return a Mongoose model
  get model() {
    throw new Error('Subclasses must implement the model getter');
  }

  // Optional field whitelist for simple updates
  get updatableFields() {
    return null; // subclasses can override
  }

  // ## CRUD Operations 
  async create(data) {
    const payload = (await this.beforeCreate(data)) ?? data;
    const doc = await this.model.create(payload);
    await this.afterCreate(doc, payload);
    return doc;
  }

  async list(filter = {}) {
    return this.model.find(filter);
  }

  async getById(id) {
    return this.model.findById(id);
  }

  async updateById(id, data) {
    const doc = await this.model.findById(id);
    if (!doc) return { doc: null, meta: {} };

    const prev = {
      completedLessons: doc.completedLessons,
      totalLessons: doc.totalLessons,
    };

    await this.beforeUpdate(doc, data, prev);
    const saved = await doc.save();
    const meta = (await this.afterUpdate(saved, prev, data)) || {};
    return { doc: saved, meta };
  }

  async deleteById(id) {
    const doc = await this.model.findById(id);
    if (!doc) return { deleted: false };
    await this.beforeDelete(doc);
    await this.model.findByIdAndDelete(id);
    await this.afterDelete(doc);
    return { deleted: true };
  }

  // ### Hooks (no-ops by default)
  async beforeCreate(data) { return data; }
  async afterCreate(doc, payload) {}
  async beforeUpdate(doc, data, prev) {
    // Default: apply only whitelisted fields if provided
    if (this.updatableFields && Array.isArray(this.updatableFields)) {
      this.applyFields(doc, data, this.updatableFields);
    }
  }
  async afterUpdate(doc, prev, data) { return {}; }
  async beforeDelete(doc) {}
  async afterDelete(doc) {}

  // ### Utilities 
  validationError(message) {
    const err = new Error(message);
    err.name = 'ValidationError';
    return err;
  }

  ensureProvided(name, value) {
    if (value === undefined || value === null || value === '') {
      throw this.validationError(`${name} is required`);
    }
  }

  parseNonNegativeInt(name, value) {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) {
      throw this.validationError(`${name} must be a valid positive number`);
    }
    return parsed;
  }

  applyFields(doc, data, fields) {
    for (const key of fields) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        doc[key] = data[key];
      }
    }
  }

  assertOwner(doc, userId) {
    if (!doc || !doc.userId) return false;
    return doc.userId.toString() === String(userId);
  }
}

module.exports = BaseOperation;

