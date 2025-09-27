const BaseOperation = require('./baseOperation');
const Assignment = require('../models/Assignment');

class AssignmentOperation extends BaseOperation {
  // tell the base class which mongoose model to use
  get model() {
    return Assignment;
  }

  // create a new assignment 
  async createAssignment(data) {
    return super.create(data);
  }

  // list assignments with an optional filter
  async getAssignments(filter = {}) {
    return super.list(filter);
  }

  // fetch a single assignment by id
  async GetAssignmentById(id) {
    return super.getById(id);
  }

  // update an assignment given the id 
  async UpdateAssignment(id, data) {
    const { doc } = await super.updateById(id, data);
    if (!doc) return null;
    return { assignment: doc };
  }

  // Hooks
  // run before we create: validate inputs and normalize the payload
  async beforeCreate(data) {
    const { userId, title, description, score } = data || {};

    // make sure it has a user and title
    this.ensureProvided('userId', userId);
    this.ensureProvided('title', title);

    // default score to 0 unless a valid value is provided
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

  // run before we update: only touch fields we care about and validate score
  async beforeUpdate(assignment, data) {
    const { title, description, score } = data || {};

    // basic field updates if provided
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;

    // score gets validated and clamped between 0..100
    if (score !== undefined) {
      assignment.score = this.parseScore(score);
    }
  }

  // helpers specific to assignment
  // parse/validate score and make sure it's within 0..100
  parseScore(value) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw this.validationError('score must be a valid number');
    }
    if (parsed < 0 || parsed > 100) {
      throw this.validationError('score must be between 0 and 100');
    }
    return parsed;
  }
}

module.exports = new AssignmentOperation();
