const BaseOperation = require('./baseOperation');
const Assignment = require('../models/Assignment');

class AssignmentOperation extends BaseOperation {
  get model() {
    return Assignment;
  }

  // ### Public API
  async createAssignment(data) {
    return super.create(data);
  }

  async getAssignments(filter = {}) {
    return super.list(filter);
  }

  async GetAssignmentById(id) {
    return super.getById(id);
  }

  async UpdateAssignment(id, data) {
    const { doc } = await super.updateById(id, data);
    if (!doc) return null;
    return { assignment: doc };
  }

  // ### Hooks
  async beforeCreate(data) {
    const { userId, title, description, score } = data || {};

    this.ensureProvided('userId', userId);
    this.ensureProvided('title', title);

    let validatedScore = 0;
    if (score !== undefined) {
      validatedScore = this.parseScore(score);
    }

    return {
      userId,
      title,
      description,
      score: validatedScore,
    };
  }

  async beforeUpdate(assignment, data) {
    const { title, description, score } = data || {};

    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;

    if (score !== undefined) {
      assignment.score = this.parseScore(score);
    }
  }

  // ### Utilities
  parseScore(value) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw this.validationError('Score must be a valid number');
    }
    if (parsed < 0 || parsed > 100) {
      throw this.validationError('Score must be between 0 and 100');
    }
    return parsed;
  }
}

module.exports = new AssignmentOperation();
