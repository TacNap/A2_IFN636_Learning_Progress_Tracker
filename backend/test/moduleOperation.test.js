const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const Module = require('../models/Module');
const Certificate = require('../models/Certificate');
const userRepository = require('../repositories/UserRepository');
const Student = require('../domain/Student');
const moduleOperation = require('../operations/moduleOperation');

describe('ModuleOperation', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('createModule', () => {
    it('creates a module with defaults', async () => {
      const userId = new mongoose.Types.ObjectId();
      const input = { userId, title: 'JS', description: 'desc', deadline: '2025-12-31' };
      const created = { _id: new mongoose.Types.ObjectId(), ...input, totalLessons: 0, completedLessons: 0 };

      const createStub = sinon.stub(Module, 'create').resolves(created);

      const result = await moduleOperation.createModule(input);

      expect(createStub.calledOnceWith({
        userId,
        title: 'JS',
        description: 'desc',
        deadline: '2025-12-31',
        totalLessons: 0,
        completedLessons: 0,
      })).to.be.true;
      expect(result).to.equal(created);
    });

    it('validates totalLessons', async () => {
      const userId = new mongoose.Types.ObjectId();
      try {
        await moduleOperation.createModule({ userId, title: 'JS', totalLessons: -1 });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Total lessons must be a valid positive number');
        expect(err.name).to.equal('ValidationError');
      }
    });

    it('requires userId and title', async () => {
      try {
        await moduleOperation.createModule({ title: 'JS' });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
      }
      try {
        await moduleOperation.createModule({ userId: new mongoose.Types.ObjectId() });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
      }
    });
  });

  describe('getModules', () => {
    it('returns filtered modules', async () => {
      const userId = new mongoose.Types.ObjectId();
      const mods = [{ _id: new mongoose.Types.ObjectId(), userId }];
      const findStub = sinon.stub(Module, 'find').resolves(mods);

      const result = await moduleOperation.getModules({ userId });

      expect(findStub.calledOnceWith({ userId })).to.be.true;
      expect(result).to.equal(mods);
    });
  });

  describe('GetModuleById', () => {
    it('returns module by id', async () => {
      const id = new mongoose.Types.ObjectId();
      const mod = { _id: id };
      const findByIdStub = sinon.stub(Module, 'findById').resolves(mod);

      const result = await moduleOperation.GetModuleById(id);
      expect(findByIdStub.calledOnceWith(id)).to.be.true;
      expect(result).to.equal(mod);
    });
  });

  describe('UpdateModule', () => {
    it('returns null when not found', async () => {
      const findByIdStub = sinon.stub(Module, 'findById').resolves(null);
      const result = await moduleOperation.UpdateModule(new mongoose.Types.ObjectId(), {});
      expect(findByIdStub.calledOnce).to.be.true;
      expect(result).to.equal(null);
    });

    it('updates fields and trims completedLessons when total decreases', async () => {
      const id = new mongoose.Types.ObjectId();
      const existing = {
        _id: id,
        userId: new mongoose.Types.ObjectId(),
        title: 'Old',
        description: 'Old',
        completed: false,
        deadline: new Date(),
        totalLessons: 10,
        completedLessons: 8,
        save: sinon.stub(),
      };
      existing.save.resolves(existing);
      sinon.stub(Module, 'findById').resolves(existing);

      const result = await moduleOperation.UpdateModule(id, {
        title: 'New',
        description: 'New',
        completed: true,
        deadline: new Date('2025-01-01'),
        totalLessons: 6,
      });

      expect(existing.title).to.equal('New');
      expect(existing.description).to.equal('New');
      expect(existing.completed).to.equal(true);
      expect(existing.totalLessons).to.equal(6);
      expect(existing.completedLessons).to.equal(6); // trimmed to total
      expect(result).to.have.property('module');
      expect(result).to.have.property('certificateEarned');
    });

    it('validates totalLessons and completedLessons', async () => {
      const id = new mongoose.Types.ObjectId();
      const existing = {
        _id: id,
        userId: new mongoose.Types.ObjectId(),
        title: 'Old',
        totalLessons: 5,
        completedLessons: 2,
        save: sinon.stub().resolvesThis(),
      };
      sinon.stub(Module, 'findById').resolves(existing);

      try {
        await moduleOperation.UpdateModule(id, { totalLessons: -1 });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.message).to.equal('Total lessons must be a valid positive number');
        expect(err.name).to.equal('ValidationError');
      }

      try {
        await moduleOperation.UpdateModule(id, { completedLessons: -1 });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.message).to.equal('Completed lessons must be a valid positive number');
        expect(err.name).to.equal('ValidationError');
      }
    });

    it('creates certificate when reaching completion', async () => {
      const id = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const existing = {
        _id: id,
        userId,
        title: 'Module A',
        totalLessons: 3,
        completedLessons: 2,
        save: sinon.stub(),
      };
      const saved = { ...existing, completedLessons: 3 };
      existing.save.resolves(saved);

      sinon.stub(Module, 'findById').resolves(existing);
      sinon.stub(userRepository, 'findById').resolves(
        new Student({ id: userId.toString(), name: 'Alice', email: 'alice@example.com' })
      );
      sinon.stub(Certificate, 'findOne').resolves(null);
      const certCreate = sinon.stub(Certificate, 'create').resolves({});

      const result = await moduleOperation.UpdateModule(id, { completedLessons: 3 });

      expect(result.certificateEarned).to.equal(true);
      expect(certCreate.calledOnce).to.be.true;
      const args = certCreate.getCall(0).args[0];
      expect(args).to.include({
        userId: userId.toString(),
        moduleId: id,
        moduleName: 'Module A',
        userName: 'Alice',
        totalLessons: 3,
      });
    });

    it('does not create duplicate certificate', async () => {
      const id = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const existing = {
        _id: id,
        userId,
        title: 'Module A',
        totalLessons: 3,
        completedLessons: 2,
        save: sinon.stub(),
      };
      const saved = { ...existing, completedLessons: 3 };
      existing.save.resolves(saved);

      sinon.stub(Module, 'findById').resolves(existing);
      sinon.stub(userRepository, 'findById').resolves(
        new Student({ id: userId.toString(), name: 'Alice', email: 'alice@example.com' })
      );
      sinon.stub(Certificate, 'findOne').resolves({ _id: new mongoose.Types.ObjectId() });
      const certCreate = sinon.stub(Certificate, 'create').resolves({});

      const result = await moduleOperation.UpdateModule(id, { completedLessons: 3 });
      expect(result.certificateEarned).to.equal(false);
      expect(certCreate.called).to.be.false;
    });
  });
  
  describe('deleteModule', () => {
    it('deletes module successfully', async () => {
      const id = new mongoose.Types.ObjectId();
      const module = { 
        _id: id, 
        userId: new mongoose.Types.ObjectId(),
        title: 'Test Module'
      };

      sinon.stub(Module, 'findById').resolves(module);
      sinon.stub(Module, 'findByIdAndDelete').resolves();
      sinon.stub(Certificate, 'deleteMany').resolves({ deletedCount: 2 });

      const result = await moduleOperation.deleteModule(id);

      expect(result).to.be.true;
    });

    it('returns false when module not found', async () => {
      sinon.stub(Module, 'findById').resolves(null);

      const result = await moduleOperation.deleteModule(new mongoose.Types.ObjectId());

      expect(result).to.be.false;
    });

    it('deletes associated certificates after deletion', async () => {
      const id = new mongoose.Types.ObjectId();
      const module = { 
        _id: id, 
        userId: new mongoose.Types.ObjectId(),
        title: 'Test Module'
      };

      sinon.stub(Module, 'findById').resolves(module);
      sinon.stub(Module, 'findByIdAndDelete').resolves();
      const deleteCertsStub = sinon.stub(Certificate, 'deleteMany').resolves({ deletedCount: 3 });

      await moduleOperation.deleteModule(id);

      expect(deleteCertsStub.calledOnceWith({ moduleId: id })).to.be.true;
    });
  });
});

