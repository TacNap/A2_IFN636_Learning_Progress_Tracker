const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const Certificate = require('../models/Certificate');
const Module = require('../models/Module');
const userRepository = require('../repositories/UserRepository');
const Student = require('../domain/Student');

const certificateOperation = require('../operations/certificateOperation');
const UserRepository = require('../repositories/UserRepository');

describe('CertificateOperation', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getCertificates', () => {
    it('certificates by default', async () => {
      const certs = [
        { _id: new mongoose.Types.ObjectId(), moduleName: 'Module 1' },
        { _id: new mongoose.Types.ObjectId(), moduleName: 'Module 2' }
      ];

      const execStub = sinon.stub().resolves(certs);
      const sortStub = sinon.stub().returns({ exec: execStub });
      const populateStub = sinon.stub().returns({ sort: sortStub });
      const findStub = sinon.stub(Certificate, 'find').returns({ populate: populateStub });

      const result = await certificateOperation.getCertificates({});
      expect(findStub.calledOnceWith({})).to.be.true;
      expect(populateStub.calledOnceWith('moduleId', 'title description')).to.be.true;
      expect(sortStub.calledOnceWith({ completionDate: -1 })).to.be.true;
      expect(result).to.equal(certs);
    });
    it('if includeModule is false dont populate', async () => {
      const certs = [{ _id: new mongoose.Types.ObjectId() }];
      
      const execStub = sinon.stub().resolves(certs);
      const sortStub = sinon.stub().returns({ exec: execStub });
      const findStub = sinon.stub(Certificate, 'find').returns({ sort: sortStub });

      const result = await certificateOperation.getCertificates({}, { includeModule: false });

      expect(findStub.calledOnceWith({})).to.be.true;
      expect(sortStub.calledOnceWith({ completionDate: -1 })).to.be.true;
      expect(result).to.equal(certs);
    });

    it('if sortByCompletionDate is false dont sort', async () => {
      const certs = [{ _id: new mongoose.Types.ObjectId() }];
      
      const execStub = sinon.stub().resolves(certs);
      const populateStub = sinon.stub().returns({ exec: execStub });
      const findStub = sinon.stub(Certificate, 'find').returns({ populate: populateStub });

      const result = await certificateOperation.getCertificates({}, { sortByCompletionDate: false });

      expect(findStub.calledOnceWith({})).to.be.true;
      expect(populateStub.calledOnceWith('moduleId', 'title description')).to.be.true;
      expect(result).to.equal(certs);
    });
  });
  describe('getCertificatesForUser', () => {
    it('return certificates for a specific user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const certs = [{ _id: new mongoose.Types.ObjectId(), userId }];

      const execStub = sinon.stub().resolves(certs);
      const sortStub = sinon.stub().returns({ exec: execStub });
      const populateStub = sinon.stub().returns({ sort: sortStub });
      const findStub = sinon.stub(Certificate, 'find').returns({ populate: populateStub });

      const result = await certificateOperation.getCertificatesForUser(userId);

      expect(findStub.calledOnceWith({ userId })).to.be.true;
      expect(result).to.equal(certs);
    });
    it('throws error if userId not provided', async () => {
      try {
        await certificateOperation.getCertificatesForUser(null);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('userId is required');
      }
    });
  });
  describe('createCertificateForModule', () => {
    it('creates certificate when module is completed', async () => {
      const userId = new mongoose.Types.ObjectId();
      const moduleId = new mongoose.Types.ObjectId();
      
      const module = {
        _id: moduleId,
        title: 'Test Module',
        totalLessons: 10,
        completedLessons: 10
      };
      
      const user = new Student({
        id: userId.toString(),
        name: 'Test User',
        email: 'test@example.com',
        profileType: 'student'
      });

      const createdCert = {
        _id: new mongoose.Types.ObjectId(),
        userId: user._id,
        moduleId: module._id,
        moduleName: module.title,
        userName: user.name,
        totalLessons: module.totalLessons
      };

      sinon.stub(Module, 'findById').resolves(module);
      sinon.stub(userRepository, 'findById').resolves(user);
      sinon.stub(Certificate, 'findOne').resolves(null);
      sinon.stub(Certificate, 'create').resolves(createdCert);

      const result = await certificateOperation.createCertificateForModule(userId, moduleId);

      expect(result).to.equal(createdCert);
    });

    it('throws error if module not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      const moduleId = new mongoose.Types.ObjectId();

      sinon.stub(Module, 'findById').resolves(null);
      sinon.stub(userRepository, 'findById').resolves({ _id: userId });
      sinon.stub(Certificate, 'findOne').resolves(null);

      try {
        await certificateOperation.createCertificateForModule(userId, moduleId);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('Module not found.');
      }
    });

    it('throws error if user not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      const moduleId = new mongoose.Types.ObjectId();

      sinon.stub(Module, 'findById').resolves({ 
        _id: moduleId, 
        title: 'Test Module',  
        totalLessons: 10,
        completedLessons: 10   
      });
      sinon.stub(userRepository, 'findById').resolves(null);
      sinon.stub(Certificate, 'findOne').resolves(null);

      try {
        await certificateOperation.createCertificateForModule(userId, moduleId);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('User not found.');
      }
    });

    it('throws error if module has no lessons', async () => {
      const userId = new mongoose.Types.ObjectId();
      const moduleId = new mongoose.Types.ObjectId();

      const user = new Student({
        id: userId.toString(),
        name: 'Test User',
        email: 'test@example.com',
        profileType: 'student'
      });

      sinon.stub(Module, 'findById').resolves({ 
        _id: moduleId, 
        totalLessons: 0,
        completedLessons: 0 
      });
      sinon.stub(userRepository, 'findById').resolves(user);
      sinon.stub(Certificate, 'findOne').resolves(null);

      try {
        await certificateOperation.createCertificateForModule(userId, moduleId);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('Module must have at least one lesson to award a certificate.');
      }
    });

    it('throws error if module not completed', async () => {
      const userId = new mongoose.Types.ObjectId();
      const moduleId = new mongoose.Types.ObjectId();

      const user = new Student({
        id: userId.toString(),
        name: 'Test User',
        email: 'test@example.com',
        profileType: 'student'
      });

      sinon.stub(Module, 'findById').resolves({ 
        _id: moduleId, 
        totalLessons: 10,
        completedLessons: 5
      });
      sinon.stub(userRepository, 'findById').resolves(user);
      sinon.stub(Certificate, 'findOne').resolves(null);

      try {
        await certificateOperation.createCertificateForModule(userId, moduleId);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('Module is not completed.');
      }
    });

    it('throws error if certificate already exists', async () => {
      const userId = new mongoose.Types.ObjectId();
      const moduleId = new mongoose.Types.ObjectId();

      const user = new Student({
        id: userId.toString(),
        name: 'Test User',
        email: 'test@example.com',
        profileType: 'student'
      });

      sinon.stub(Module, 'findById').resolves({ 
        _id: moduleId,
        title: 'Test Module',
        totalLessons: 10,
        completedLessons: 10
      });
      sinon.stub(userRepository, 'findById').resolves(user);
      sinon.stub(Certificate, 'findOne').resolves({ _id: new mongoose.Types.ObjectId() });

      try {
        await certificateOperation.createCertificateForModule(userId, moduleId);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('Certificate already issued for this module.');
      }
    });

    it('requires userId', async () => {
      const moduleId = new mongoose.Types.ObjectId();

      try {
        await certificateOperation.createCertificateForModule(null, moduleId);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('userId is required');
      }
    });

    it('requires moduleId', async () => {
      const userId = new mongoose.Types.ObjectId();

      try {
        await certificateOperation.createCertificateForModule(userId, null);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('moduleId is required');
      }
    });
  });

  describe('deleteCertificateById', () => {
    it('deletes certificate successfully', async () => {
      const certId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      
      const cert = {
        _id: certId,
        userId: userId,
        deleteOne: sinon.stub().resolves()
      };

      sinon.stub(Certificate, 'findById').resolves(cert);

      const result = await certificateOperation.deleteCertificateById(certId, userId);

      expect(result.deleted).to.be.true;
      expect(result.certificate).to.equal(cert);
      expect(cert.deleteOne.calledOnce).to.be.true;
    });

    it('returns not_found when certificate does not exist', async () => {
      const certId = new mongoose.Types.ObjectId();
      
      sinon.stub(Certificate, 'findById').resolves(null);

      const result = await certificateOperation.deleteCertificateById(certId);

      expect(result.deleted).to.be.false;
      expect(result.reason).to.equal('not_found');
    });

    it('returns forbidden when user is not owner', async () => {
      const certId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const differentUserId = new mongoose.Types.ObjectId();
      
      const cert = {
        _id: certId,
        userId: userId,
        deleteOne: sinon.stub().resolves()
      };

      sinon.stub(Certificate, 'findById').resolves(cert);

      const result = await certificateOperation.deleteCertificateById(certId, differentUserId);

      expect(result.deleted).to.be.false;
      expect(result.reason).to.equal('forbidden');
      expect(cert.deleteOne.called).to.be.false;
    });

    it('allows deletion without userId check', async () => {
      const certId = new mongoose.Types.ObjectId();
      
      const cert = {
        _id: certId,
        userId: new mongoose.Types.ObjectId(),
        deleteOne: sinon.stub().resolves()
      };

      sinon.stub(Certificate, 'findById').resolves(cert);

      const result = await certificateOperation.deleteCertificateById(certId);

      expect(result.deleted).to.be.true;
      expect(cert.deleteOne.calledOnce).to.be.true;
    });
  });

  describe('deleteCertificatesByModule', () => {
    it('deletes all certificates for a module', async () => {
      const moduleId = new mongoose.Types.ObjectId();
      
      const deleteManyStub = sinon.stub(Certificate, 'deleteMany').resolves({ deletedCount: 3 });

      const result = await certificateOperation.deleteCertificatesByModule(moduleId);

      expect(deleteManyStub.calledOnceWith({ moduleId })).to.be.true;
      expect(result.deletedCount).to.equal(3);
    });

    it('returns 0 when no certificates found', async () => {
      const moduleId = new mongoose.Types.ObjectId();
      
      sinon.stub(Certificate, 'deleteMany').resolves({ deletedCount: 0 });

      const result = await certificateOperation.deleteCertificatesByModule(moduleId);

      expect(result.deletedCount).to.equal(0);
    });

    it('requires moduleId', async () => {
      try {
        await certificateOperation.deleteCertificatesByModule(null);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.equal('moduleId is required');
      }
    });
  });
});