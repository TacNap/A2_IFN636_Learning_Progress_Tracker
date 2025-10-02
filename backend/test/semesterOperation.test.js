const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const Semester = require('../models/Semester');
const Module = require('../models/Module');
const semesterOperation = require('../operations/semesterOperation');

describe('SemesterOperation', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('createSemester', () => {
    it('creates semester with valid data', async () => {
      const userId = new mongoose.Types.ObjectId();
      const moduleId1 = new mongoose.Types.ObjectId();
      const moduleId2 = new mongoose.Types.ObjectId();
      
      const input = {
        userId,
        number: 1,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        modules: [moduleId1, moduleId2]
      };

      const created = {
        _id: new mongoose.Types.ObjectId(),
        ...input,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30'),
        modules: [moduleId1.toString(), moduleId2.toString()]
      };

      sinon.stub(Module, 'countDocuments').resolves(2);
      sinon.stub(Semester, 'create').resolves(created);

      const result = await semesterOperation.createSemester(input);

      expect(result).to.equal(created);
    });

    it('creates semester with empty modules array', async () => {
      const userId = new mongoose.Types.ObjectId();
      const input = {
        userId,
        number: 2,
        startDate: '2025-07-01',
        endDate: '2025-12-31',
        modules: []
      };

      const created = { _id: new mongoose.Types.ObjectId(), ...input };

      sinon.stub(Semester, 'create').resolves(created);

      const result = await semesterOperation.createSemester(input);

      expect(result).to.equal(created);
    });

    it('requires userId', async () => {
      try {
        await semesterOperation.createSemester({
          number: 1,
          startDate: '2025-01-01',
          endDate: '2025-06-30'
        });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('userId is required');
      }
    });

    it('requires number', async () => {
      try {
        await semesterOperation.createSemester({
          userId: new mongoose.Types.ObjectId(),
          startDate: '2025-01-01',
          endDate: '2025-06-30'
        });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('number is required');
      }
    });

    it('requires startDate', async () => {
      try {
        await semesterOperation.createSemester({
          userId: new mongoose.Types.ObjectId(),
          number: 1,
          endDate: '2025-06-30'
        });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('startDate is required');
      }
    });

    it('requires endDate', async () => {
      try {
        await semesterOperation.createSemester({
          userId: new mongoose.Types.ObjectId(),
          number: 1,
          startDate: '2025-01-01'
        });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('endDate is required');
      }
    });
  });

  describe('getSemesters', () => {
    it('returns filtered semesters', async () => {
      const userId = new mongoose.Types.ObjectId();
      const semesters = [
        { _id: new mongoose.Types.ObjectId(), userId, number: 1 },
        { _id: new mongoose.Types.ObjectId(), userId, number: 2 }
      ];

      sinon.stub(Semester, 'find').resolves(semesters);

      const result = await semesterOperation.getSemesters({ userId });

      expect(result).to.equal(semesters);
    });
  });

  describe('getSemesterById', () => {
    it('returns semester by id', async () => {
      const id = new mongoose.Types.ObjectId();
      const semester = { _id: id, number: 1 };

      sinon.stub(Semester, 'findById').resolves(semester);

      const result = await semesterOperation.getSemesterById(id);

      expect(result).to.equal(semester);
    });
  });

  describe('updateSemester', () => {
    it('updates semester fields successfully', async () => {
      const id = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const moduleId = new mongoose.Types.ObjectId();
      
      const existingSemester = {
        _id: id,
        userId,
        number: 1,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30'),
        modules: [],
        save: sinon.stub().resolvesThis()
      };

      sinon.stub(Semester, 'findById').resolves(existingSemester);
      sinon.stub(Module, 'countDocuments').resolves(1);

      const result = await semesterOperation.updateSemester(id, {
        number: 2,
        modules: [moduleId]
      });

      expect(existingSemester.number).to.equal(2);
      expect(existingSemester.modules).to.deep.equal([moduleId.toString()]);
      expect(result).to.equal(existingSemester);
    });

    it('returns null when semester not found', async () => {
      sinon.stub(Semester, 'findById').resolves(null);

      const result = await semesterOperation.updateSemester(new mongoose.Types.ObjectId(), {});

      expect(result).to.be.null;
    });
  });

  describe('deleteSemester', () => {
    it('deletes semester successfully', async () => {
      const id = new mongoose.Types.ObjectId();
      const semester = { _id: id };

      sinon.stub(Semester, 'findById').resolves(semester);
      sinon.stub(Semester, 'findByIdAndDelete').resolves();

      const result = await semesterOperation.deleteSemester(id);

      expect(result).to.be.true;
    });

    it('returns false when semester not found', async () => {
      sinon.stub(Semester, 'findById').resolves(null);

      const result = await semesterOperation.deleteSemester(new mongoose.Types.ObjectId());

      expect(result).to.be.false;
    });
  });

  describe('parseSemesterNumber', () => {
    it('parses valid semester numbers', () => {
      expect(semesterOperation.parseSemesterNumber(1)).to.equal(1);
      expect(semesterOperation.parseSemesterNumber('5')).to.equal(5);
      expect(semesterOperation.parseSemesterNumber(10)).to.equal(10);
    });

    it('throws error for zero', () => {
      expect(() => semesterOperation.parseSemesterNumber(0)).to.throw('number must be a positive whole integer');
    });

    it('throws error for negative numbers', () => {
      expect(() => semesterOperation.parseSemesterNumber(-1)).to.throw('number must be a positive whole integer');
    });

    it('throws error for decimals', () => {
      expect(() => semesterOperation.parseSemesterNumber(1.5)).to.throw('number must be a positive whole integer');
    });

    it('throws error for non-numeric values', () => {
      expect(() => semesterOperation.parseSemesterNumber('abc')).to.throw('number must be a positive whole integer');
    });
  });

  describe('parseDate', () => {
    it('parses valid date strings', () => {
      const result = semesterOperation.parseDate('2025-01-01', 'testDate');
      expect(result).to.be.instanceOf(Date);
      expect(result.toISOString()).to.include('2025-01-01');
    });

    it('parses Date objects', () => {
      const date = new Date('2025-06-30');
      const result = semesterOperation.parseDate(date, 'testDate');
      expect(result).to.be.instanceOf(Date);
    });

    it('throws error for invalid dates', () => {
      expect(() => semesterOperation.parseDate('invalid', 'testDate')).to.throw('testDate must be a valid date');
      expect(() => semesterOperation.parseDate('', 'testDate')).to.throw('testDate must be a valid date');
    });
  });

  describe('normaliseModules', () => {
    it('validates and returns module IDs', async () => {
      const userId = new mongoose.Types.ObjectId();
      const moduleId1 = new mongoose.Types.ObjectId();
      const moduleId2 = new mongoose.Types.ObjectId();

      sinon.stub(Module, 'countDocuments').resolves(2);

      const result = await semesterOperation.normaliseModules(userId, [moduleId1, moduleId2]);

      expect(result).to.deep.equal([moduleId1.toString(), moduleId2.toString()]);
    });

    it('returns empty array for empty input', async () => {
      const userId = new mongoose.Types.ObjectId();

      const result = await semesterOperation.normaliseModules(userId, []);

      expect(result).to.deep.equal([]);
    });

    it('throws error if not an array', async () => {
      const userId = new mongoose.Types.ObjectId();

      try {
        await semesterOperation.normaliseModules(userId, 'not an array');
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('modules must be an array of module IDs');
      }
    });

    it('throws error for more than 4 modules', async () => {
      const userId = new mongoose.Types.ObjectId();
      const modules = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ];

      try {
        await semesterOperation.normaliseModules(userId, modules);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('A semester can include at most 4 modules.');
      }
    });

    it('throws error for empty module IDs', async () => {
      const userId = new mongoose.Types.ObjectId();

      try {
        await semesterOperation.normaliseModules(userId, [null]);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('modules cannot contain empty values');
      }
    });

    it('throws error for invalid ObjectId', async () => {
      const userId = new mongoose.Types.ObjectId();

      try {
        await semesterOperation.normaliseModules(userId, ['invalid-id']);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.include('Invalid module id');
      }
    });

    it('throws error for duplicate module IDs', async () => {
      const userId = new mongoose.Types.ObjectId();
      const moduleId = new mongoose.Types.ObjectId();

      try {
        await semesterOperation.normaliseModules(userId, [moduleId, moduleId]);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('modules must not contain duplicates');
      }
    });

    it('throws error if modules do not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const moduleId1 = new mongoose.Types.ObjectId();
      const moduleId2 = new mongoose.Types.ObjectId();

      sinon.stub(Module, 'countDocuments').resolves(1); // Only 1 found instead of 2

      try {
        await semesterOperation.normaliseModules(userId, [moduleId1, moduleId2]);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('One or more modules do not exist or belong to the user');
      }
    });

    it('throws error if modules belong to different user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const moduleId = new mongoose.Types.ObjectId();

      sinon.stub(Module, 'countDocuments').resolves(0); // None found for this user

      try {
        await semesterOperation.normaliseModules(userId, [moduleId]);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('One or more modules do not exist or belong to the user');
      }
    });
  });
});