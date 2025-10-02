const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const Assignment = require('../models/Assignment');
const assignmentOperation = require('../operations/assignmentOperation');

describe('AssignmentOperation', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('createAssignment', () => {
    it('creates an assignment with valid data', async () => {
      const userId = new mongoose.Types.ObjectId();
      const input = { 
        userId, 
        title: 'Math Homework', 
        description: 'Algebra problems', 
        score: 85 
      };
      const created = { 
        _id: new mongoose.Types.ObjectId(), 
        ...input 
      };

      const createStub = sinon.stub(Assignment, 'create').resolves(created);

      const result = await assignmentOperation.createAssignment(input);

      expect(createStub.calledOnceWith({
        userId,
        title: 'Math Homework',
        description: 'Algebra problems',
        score: 85,
      })).to.be.true;
      expect(result).to.equal(created);
    });

    it('validates score is within 0-100 range', async () => {
      const userId = new mongoose.Types.ObjectId();
      
      // test score validations
      try {
        await assignmentOperation.createAssignment({ 
          userId, 
          title: 'Test', 
          score: 150 
        });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('score must be between 0 and 100');
      }

      // no negatives
      try {
        await assignmentOperation.createAssignment({ 
          userId, 
          title: 'Test', 
          score: -10 
        });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('score must be between 0 and 100');
      }
    });

    it('validates score is a number', async () => {
      const userId = new mongoose.Types.ObjectId();
      
      try {
        await assignmentOperation.createAssignment({ 
          userId, 
          title: 'Test', 
          score: 'invalid score' 
        });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('score must be a valid number');
      }
    });

    it('requires userId', async () => {
      try {
        await assignmentOperation.createAssignment({ title: 'Test Assignment' });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('userId is required');
      }
    });

    it('requires title', async () => {
      const userId = new mongoose.Types.ObjectId();
      
      try {
        await assignmentOperation.createAssignment({ userId });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('title is required');
      }
    });
  });

  describe('getAssignments', () => {
    it('returns filtered assignments', async () => {
      const userId = new mongoose.Types.ObjectId();
      const assignments = [
        { _id: new mongoose.Types.ObjectId(), userId, title: 'Assignment 1', score: 85 },
        { _id: new mongoose.Types.ObjectId(), userId, title: 'Assignment 2', score: 92 }
      ];
      
      const findStub = sinon.stub(Assignment, 'find').resolves(assignments);

      const result = await assignmentOperation.getAssignments({ userId });

      expect(findStub.calledOnceWith({ userId })).to.be.true;
      expect(result).to.equal(assignments);
    });

    it('returns all assignments', async () => {
      const assignments = [
        { _id: new mongoose.Types.ObjectId(), title: 'Assignment 1' },
        { _id: new mongoose.Types.ObjectId(), title: 'Assignment 2' }
      ];
      
      const findStub = sinon.stub(Assignment, 'find').resolves(assignments);

      const result = await assignmentOperation.getAssignments();

      expect(findStub.calledOnceWith({})).to.be.true;
      expect(result).to.equal(assignments);
    });
  });

  describe('GetAssignmentById', () => {
    it('returns assignment by id', async () => {
      const id = new mongoose.Types.ObjectId();
      const assignment = { 
        _id: id, 
        title: 'Test Assignment', 
        score: 75 
      };
      
      const findByIdStub = sinon.stub(Assignment, 'findById').resolves(assignment);

      const result = await assignmentOperation.GetAssignmentById(id);

      expect(findByIdStub.calledOnceWith(id)).to.be.true;
      expect(result).to.equal(assignment);
    });

    it('returns null when assignment not found', async () => {
      const id = new mongoose.Types.ObjectId();
      const findByIdStub = sinon.stub(Assignment, 'findById').resolves(null);

      const result = await assignmentOperation.GetAssignmentById(id);

      expect(findByIdStub.calledOnceWith(id)).to.be.true;
      expect(result).to.be.null;
    });
  });

  describe('UpdateAssignment', () => {
    it('returns null when assignment not found', async () => {
      const id = new mongoose.Types.ObjectId();
      const findByIdStub = sinon.stub(Assignment, 'findById').resolves(null);

      const result = await assignmentOperation.UpdateAssignment(id, {});

      expect(findByIdStub.calledOnceWith(id)).to.be.true;
      expect(result).to.be.null;
    });

    it('updates assignment fields successfully', async () => {
      const id = new mongoose.Types.ObjectId();
      const existingAssignment = {
        _id: id,
        userId: new mongoose.Types.ObjectId(),
        title: 'Old Title',
        description: 'Old Description',
        score: 50,
        save: sinon.stub(),
      };
      existingAssignment.save.resolves(existingAssignment);

      const findByIdStub = sinon.stub(Assignment, 'findById').resolves(existingAssignment);

      const result = await assignmentOperation.UpdateAssignment(id, {
        title: 'New Title',
        description: 'New Description',
        score: 90,
      });

      expect(existingAssignment.title).to.equal('New Title');
      expect(existingAssignment.description).to.equal('New Description');
      expect(existingAssignment.score).to.equal(90);
      expect(existingAssignment.save.calledOnce).to.be.true;
      expect(result).to.have.property('assignment');
      expect(result.assignment).to.equal(existingAssignment);
    });

    it('only updates provided fields', async () => {
      const id = new mongoose.Types.ObjectId();
      const existingAssignment = {
        _id: id,
        userId: new mongoose.Types.ObjectId(),
        title: 'Original Title',
        description: 'Original Description',
        score: 75,
        save: sinon.stub(),
      };
      existingAssignment.save.resolves(existingAssignment);

      const findByIdStub = sinon.stub(Assignment, 'findById').resolves(existingAssignment);

      const result = await assignmentOperation.UpdateAssignment(id, {
        score: 85, // only updating score
      });

      expect(existingAssignment.title).to.equal('Original Title'); // unchanged
      expect(existingAssignment.description).to.equal('Original Description'); // unchanged
      expect(existingAssignment.score).to.equal(85); // updated
      expect(result.assignment).to.equal(existingAssignment);
    });

    it('validates score during update', async () => {
      const id = new mongoose.Types.ObjectId();
      const existingAssignment = {
        _id: id,
        userId: new mongoose.Types.ObjectId(),
        title: 'Test Assignment',
        score: 50,
        save: sinon.stub(),
      };

      const findByIdStub = sinon.stub(Assignment, 'findById').resolves(existingAssignment);

      // cant update invalid score
      try {
        await assignmentOperation.UpdateAssignment(id, { score: 'invalid' });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('score must be a valid number');
      }

      try {
        await assignmentOperation.UpdateAssignment(id, { score: 150 });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('score must be between 0 and 100');
      }
    });
  });

  describe('parseScore', () => {
    it('parses valid numeric scores', () => {
      expect(assignmentOperation.parseScore(85)).to.equal(85);
      expect(assignmentOperation.parseScore('75')).to.equal(75);
      expect(assignmentOperation.parseScore(0)).to.equal(0);
      expect(assignmentOperation.parseScore(100)).to.equal(100);
      expect(assignmentOperation.parseScore('100.0')).to.equal(100);
    });

    it('throws error for non-numeric values', () => {
      expect(() => assignmentOperation.parseScore('abc')).to.throw('score must be a valid number');
      expect(() => assignmentOperation.parseScore(undefined)).to.throw('score must be a valid number');
    });

    it('throws error for scores outside 0-100 range', () => {
      expect(() => assignmentOperation.parseScore(-1)).to.throw('score must be between 0 and 100');
      expect(() => assignmentOperation.parseScore(101)).to.throw('score must be between 0 and 100');
      expect(() => assignmentOperation.parseScore(-50)).to.throw('score must be between 0 and 100');
      expect(() => assignmentOperation.parseScore(150)).to.throw('score must be between 0 and 100');
    });
  });
});