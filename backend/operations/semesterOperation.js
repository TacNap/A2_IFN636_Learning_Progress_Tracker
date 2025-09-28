const mongoose = require('mongoose');
const BaseOperation = require('./baseOperation');
const Semester = require('../models/Semester');
const Module = require('../models/Module');

class SemesterOperation extends BaseOperation {
  get model() {
    return Semester;
  }

  async createSemester(data) {
    return super.create(data);
  }

  async getSemesters(filter = {}) {
    return super.list(filter);
  }

  async getSemesterById(id) {
    return super.getById(id);
  }

  async updateSemester(id, data) {
    const { doc } = await super.updateById(id, data);
    return doc;
  }

  async deleteSemester(id) {
    const { deleted } = await super.deleteById(id);
    return deleted;
  }

  async beforeCreate(data) {
    const { userId, number, startDate, endDate, modules = [] } = data || {};

    this.ensureProvided('userId', userId);
    this.ensureProvided('number', number);
    this.ensureProvided('startDate', startDate);
    this.ensureProvided('endDate', endDate);

    const validatedNumber = this.parseSemesterNumber(number);
    const validatedStartDate = this.parseDate(startDate, 'startDate');
    const validatedEndDate = this.parseDate(endDate, 'endDate');
    const validatedModules = await this.normaliseModules(userId, modules);

    return {
      userId,
      number: validatedNumber,
      startDate: validatedStartDate,
      endDate: validatedEndDate,
      modules: validatedModules,
    };
  }

  async beforeUpdate(semester, data = {}) {
    const { number, startDate, endDate, modules } = data;

    if (number !== undefined) {
      semester.number = this.parseSemesterNumber(number);
    }

    if (startDate !== undefined) {
      semester.startDate = this.parseDate(startDate, 'startDate');
    }

    if (endDate !== undefined) {
      semester.endDate = this.parseDate(endDate, 'endDate');
    }

    if (modules !== undefined) {
      semester.modules = await this.normaliseModules(semester.userId, modules);
    }
  }

  async normaliseModules(userId, modules = []) {
    if (!Array.isArray(modules)) {
      throw this.validationError('modules must be an array of module IDs');
    }

    if (modules.length > 4) {
      throw this.validationError('A semester can include at most 4 modules.');
    }

    if (modules.length === 0) {
      return [];
    }

    const stringIds = modules.map((moduleId) => {
      if (moduleId === undefined || moduleId === null || moduleId === '') {
        throw this.validationError('modules cannot contain empty values');
      }

      const id = moduleId.toString();
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw this.validationError(`Invalid module id: ${moduleId}`);
      }
      return id;
    });

    const uniqueIds = new Set(stringIds);
    if (uniqueIds.size !== stringIds.length) {
      throw this.validationError('modules must not contain duplicates');
    }

    const foundCount = await Module.countDocuments({
      _id: { $in: Array.from(uniqueIds) },
      userId,
    });

    if (foundCount !== uniqueIds.size) {
      throw this.validationError('One or more modules do not exist or belong to the user');
    }

    return stringIds;
  }

  parseSemesterNumber(value) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw this.validationError('number must be a positive whole integer');
    }
    return parsed;
  }

  parseDate(value, fieldName) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw this.validationError(`${fieldName} must be a valid date`);
    }
    return date;
  }
}

module.exports = new SemesterOperation();
