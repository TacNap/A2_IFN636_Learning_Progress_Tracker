const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const Certificate = require('../models/Certificate');
const Module = require('../models/Module');
const User = require('../models/User');
const certificateOperation = require('../operations/certificateOperation');

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
    it('skips populate when includeModule is false', async () => {
      const certs = [{ _id: new mongoose.Types.ObjectId() }];
      
      const execStub = sinon.stub().resolves(certs);
      const sortStub = sinon.stub().returns({ exec: execStub });
      const findStub = sinon.stub(Certificate, 'find').returns({ sort: sortStub });

      const result = await certificateOperation.getCertificates({}, { includeModule: false });

      expect(findStub.calledOnceWith({})).to.be.true;
      expect(sortStub.calledOnceWith({ completionDate: -1 })).to.be.true;
      expect(result).to.equal(certs);
    });

    it('skips sorting when sortByCompletionDate is false', async () => {
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
});