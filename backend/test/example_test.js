const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Module = require('../models/Module');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { getModules, addModule, updateModule, deleteModule, updateLessons } = require('../controllers/moduleController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

describe('AddModule Function Test', () => {

  it('should create a new module successfully', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { 
        title: "JavaScript Basics", 
        description: "Learn JavaScript fundamentals", 
        deadline: "2025-12-31",
        totalLessons: 10
      }
    };

    const createdModule = { 
      _id: new mongoose.Types.ObjectId(), 
      userId: req.user.id,
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      totalLessons: req.body.totalLessons,
      completedLessons: 0
    };

    const createStub = sinon.stub(Module, 'create').resolves(createdModule);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addModule(req, res);

    expect(createStub.calledOnceWith({ 
      userId: req.user.id, 
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      totalLessons: req.body.totalLessons,
      completedLessons: 0
    })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdModule)).to.be.true;

    createStub.restore();
  });

  it('should create module with default totalLessons if not provided', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { 
        title: "React Basics", 
        description: "Learn React fundamentals", 
        deadline: "2025-12-31"
      }
    };

    const createdModule = { 
      _id: new mongoose.Types.ObjectId(), 
      userId: req.user.id,
      totalLessons: 0,
      completedLessons: 0,
      ...req.body
    };

    const createStub = sinon.stub(Module, 'create').resolves(createdModule);
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addModule(req, res);

    expect(createStub.calledOnceWith({ 
      userId: req.user.id, 
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      totalLessons: 0,
      completedLessons: 0
    })).to.be.true;

    createStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const createStub = sinon.stub(Module, 'create').throws(new Error('DB Error'));

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: "New Module", description: "Module description", deadline: "2025-12-31" }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addModule(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    createStub.restore();
  });

});

describe('GetModules Function Test', () => {

  it('should return modules for the given user', async () => {
    const userId = new mongoose.Types.ObjectId();

    const modules = [
      { _id: new mongoose.Types.ObjectId(), title: "Module 1", userId, totalLessons: 5, completedLessons: 2 },
      { _id: new mongoose.Types.ObjectId(), title: "Module 2", userId, totalLessons: 8, completedLessons: 8 }
    ];

    const findStub = sinon.stub(Module, 'find').resolves(modules);

    const req = { user: { id: userId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getModules(req, res);

    expect(findStub.calledOnceWith({ userId })).to.be.true;
    expect(res.json.calledWith(modules)).to.be.true;
    expect(res.status.called).to.be.false;

    findStub.restore();
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Module, 'find').throws(new Error('DB Error'));

    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getModules(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findStub.restore();
  });

});

describe('UpdateModule Function Test', () => {

  it('should update module successfully', async () => {
    const moduleId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const existingModule = {
      _id: moduleId,
      userId: userId,
      title: "Old Module",
      description: "Old Description",
      completed: false,
      deadline: new Date(),
      totalLessons: 5,
      completedLessons: 2,
      save: sinon.stub().resolvesThis(),
    };

    const findByIdStub = sinon.stub(Module, 'findById').resolves(existingModule);

    const req = {
      params: { id: moduleId },
      user: { id: userId.toString() },
      body: { title: "Updated Module", description: "Updated Description", totalLessons: 8 }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    await updateModule(req, res);

    expect(existingModule.title).to.equal("Updated Module");
    expect(existingModule.description).to.equal("Updated Description");
    expect(existingModule.totalLessons).to.equal(8);
    expect(res.status.called).to.be.false;
    expect(res.json.calledOnce).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if module is not found', async () => {
    const findByIdStub = sinon.stub(Module, 'findById').resolves(null);

    const req = { 
      params: { id: new mongoose.Types.ObjectId() }, 
      user: { id: new mongoose.Types.ObjectId().toString() },
      body: {} 
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateModule(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Module not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 403 if user is not authorized', async () => {
    const moduleId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const differentUserId = new mongoose.Types.ObjectId();
    
    const existingModule = {
      _id: moduleId,
      userId: userId,
      title: "Module",
    };

    const findByIdStub = sinon.stub(Module, 'findById').resolves(existingModule);

    const req = {
      params: { id: moduleId },
      user: { id: differentUserId.toString() },
      body: { title: "Updated Module" }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateModule(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({ message: 'Not authorized to update this module' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 400 for invalid totalLessons', async () => {
    const moduleId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const existingModule = {
      _id: moduleId,
      userId: userId,
      totalLessons: 5,
      completedLessons: 2,
    };

    const findByIdStub = sinon.stub(Module, 'findById').resolves(existingModule);

    const req = {
      params: { id: moduleId },
      user: { id: userId.toString() },
      body: { totalLessons: "invalid" }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateModule(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Total lessons must be a valid positive number' })).to.be.true;

    findByIdStub.restore();
  });

});

describe('UpdateLessons Function Test', () => {

  it('should increment lessons successfully', async () => {
    const moduleId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const existingModule = {
      _id: moduleId,
      userId: userId,
      title: "Test Module",
      totalLessons: 10,
      completedLessons: 5,
      save: sinon.stub().resolvesThis(),
    };

    const findByIdStub = sinon.stub(Module, 'findById').resolves(existingModule);
    const userFindByIdStub = sinon.stub(User, 'findById').resolves(null);
    const certificateFindOneStub = sinon.stub(Certificate, 'findOne').resolves(null);
    const certificateCreateStub = sinon.stub(Certificate, 'create').resolves({});

    const req = {
      params: { id: moduleId },
      user: { id: userId.toString() },
      body: { increment: 1 }
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await updateLessons(req, res);

    expect(existingModule.completedLessons).to.equal(6);
    expect(res.json.calledOnce).to.be.true;
    
    const responseData = res.json.getCall(0).args[0];
    expect(responseData).to.have.property('module');
    expect(responseData).to.have.property('certificateEarned');

    findByIdStub.restore();
    userFindByIdStub.restore();
    certificateFindOneStub.restore();
    certificateCreateStub.restore();
  });

  it('should create certificate when module is completed', async () => {
    const moduleId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const existingModule = {
      _id: moduleId,
      userId: userId,
      title: "Test Module",
      totalLessons: 10,
      completedLessons: 9,
      save: sinon.stub().resolvesThis(),
    };

    const user = {
      _id: userId,
      name: "Test User"
    };

    const findByIdStub = sinon.stub(Module, 'findById').resolves(existingModule);
    const userFindByIdStub = sinon.stub(User, 'findById').resolves(user);
    const certificateFindOneStub = sinon.stub(Certificate, 'findOne').resolves(null);
    const certificateCreateStub = sinon.stub(Certificate, 'create').resolves({});

    const req = {
      params: { id: moduleId },
      user: { id: userId.toString() },
      body: { increment: 1 }
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await updateLessons(req, res);

    expect(existingModule.completedLessons).to.equal(10);
    expect(certificateCreateStub.calledOnce).to.be.true;
    
    const responseData = res.json.getCall(0).args[0];
    expect(responseData.certificateEarned).to.be.true;

    findByIdStub.restore();
    userFindByIdStub.restore();
    certificateFindOneStub.restore();
    certificateCreateStub.restore();
  });

  it('should return 400 for negative completed lessons', async () => {
    const moduleId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const existingModule = {
      _id: moduleId,
      userId: userId,
      totalLessons: 10,
      completedLessons: 0,
    };

    const findByIdStub = sinon.stub(Module, 'findById').resolves(existingModule);

    const req = {
      params: { id: moduleId },
      user: { id: userId.toString() },
      body: { increment: -1 }
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await updateLessons(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Cannot have negative completed lessons' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 400 when exceeding total lessons', async () => {
    const moduleId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const existingModule = {
      _id: moduleId,
      userId: userId,
      totalLessons: 10,
      completedLessons: 10,
    };

    const findByIdStub = sinon.stub(Module, 'findById').resolves(existingModule);

    const req = {
      params: { id: moduleId },
      user: { id: userId.toString() },
      body: { increment: 1 }
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await updateLessons(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Only 10 lessons in this module' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 400 for invalid increment', async () => {
    const moduleId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const existingModule = {
      _id: moduleId,
      userId: userId,
      totalLessons: 10,
      completedLessons: 5,
    };

    const findByIdStub = sinon.stub(Module, 'findById').resolves(existingModule);

    const req = {
      params: { id: moduleId },
      user: { id: userId.toString() },
      body: { increment: "invalid" }
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await updateLessons(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Increment must be a valid number' })).to.be.true;

    findByIdStub.restore();
  });

});

describe('DeleteModule Function Test', () => {

  it('should delete a module successfully', async () => {
    const moduleId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    
    const existingModule = {
      _id: moduleId,
      userId: userId,
      title: "Module to Delete"
    };

    const findByIdStub = sinon.stub(Module, 'findById').resolves(existingModule);
    const certificateDeleteManyStub = sinon.stub(Certificate, 'deleteMany').resolves();
    const moduleDeleteStub = sinon.stub(Module, 'findByIdAndDelete').resolves();

    const req = {
      params: { id: moduleId.toString() },
      user: { id: userId.toString() }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteModule(req, res);

    expect(findByIdStub.calledOnceWith(moduleId.toString())).to.be.true;
    expect(certificateDeleteManyStub.calledOnceWith({ moduleId: moduleId.toString() })).to.be.true;
    expect(moduleDeleteStub.calledOnceWith(moduleId.toString())).to.be.true;
    expect(res.json.calledWith({ message: 'Module deleted' })).to.be.true;

    findByIdStub.restore();
    certificateDeleteManyStub.restore();
    moduleDeleteStub.restore();
  });

  it('should return 404 if module is not found', async () => {
    const findByIdStub = sinon.stub(Module, 'findById').resolves(null);

    const req = { 
      params: { id: new mongoose.Types.ObjectId().toString() },
      user: { id: new mongoose.Types.ObjectId().toString() }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteModule(req, res);

    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Module not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 403 if user is not authorized', async () => {
    const moduleId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const differentUserId = new mongoose.Types.ObjectId();
    
    const existingModule = {
      _id: moduleId,
      userId: userId,
      title: "Module"
    };

    const findByIdStub = sinon.stub(Module, 'findById').resolves(existingModule);

    const req = {
      params: { id: moduleId.toString() },
      user: { id: differentUserId.toString() }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteModule(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({ message: 'Not authorized to delete this module' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const findByIdStub = sinon.stub(Module, 'findById').throws(new Error('DB Error'));

    const req = { 
      params: { id: new mongoose.Types.ObjectId().toString() },
      user: { id: new mongoose.Types.ObjectId().toString() }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteModule(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findByIdStub.restore();
  });

});