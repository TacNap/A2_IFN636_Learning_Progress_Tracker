const certificateOperation = require('../operations/certificateOperation');

const mapValidationStatus = (message) => {
  if (/not found/i.test(message)) return 404;
  if (/already issued/i.test(message)) return 409;
  return 400;
};

const getCertificates = async (req, res) => {
  try {
    const certificates = await certificateOperation.getCertificatesForUser(req.user.id);
    res.json(certificates);
  } catch (error) {
    const status = error.name === 'ValidationError' ? mapValidationStatus(error.message) : 500;
    res.status(status).json({ message: error.message });
  }
};

const createCertificate = async (req, res) => {
  const { moduleId } = req.body;
  try {
    const certificate = await certificateOperation.createCertificateForModule(req.user.id, moduleId);
    res.status(201).json(certificate);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const status = mapValidationStatus(error.message);
      return res.status(status).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    const result = await certificateOperation.deleteCertificateById(req.params.id, req.user.id);
    if (!result.deleted) {
      if (result.reason === 'not_found') {
        return res.status(404).json({ message: 'Certificate not found.' });
      }
      if (result.reason === 'forbidden') {
        return res.status(403).json({ message: 'Not authorised to delete this certificate.' });
      }
    }
    res.json({ message: 'Certificate deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCertificatesByModule = async (moduleId) => {
  try {
    await certificateOperation.deleteCertificatesByModule(moduleId);
  } catch (error) {
    console.error('Error deleting certificates for module:', error);
  }
};

module.exports = {
  getCertificates,
  createCertificate,
  deleteCertificate,
  deleteCertificatesByModule,
};
