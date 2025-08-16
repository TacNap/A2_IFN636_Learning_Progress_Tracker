const Certificate = require('../models/Certificate');
const Module = require('../models/Module');
const user = require('../models/User');

const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find( {userId: req.user.id })
        .populate('moduleId', 'title description')
        .sort({ completionDate: -1 });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCertificate = async (req, res) => {
    const { moduleId } = req.body;
    try {

        const module = await Module.findById(moduleId);
        const user = await User.findById(req.user.id);

        if (!module || !user) {
            return res.status(404).json({ message: 'Module or User not found.' });
        }

        if (module.completedLessons < module.totalLessons) {
            return res.status(400).json({ message: 'Module is not completed.' });
        }

        const certificate = await Certificate.create({
            userId: user._id,
            moduleId: module._id,
            moduleName: module.title,
            userName: user.name,
            totalLessons: module.totalLessons
        });
        res.status(201).json(certificate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCertificate = async (req, res) => {
    try{
        const certificate = await Certificate.findById(req.params.id);

        if(!certificate) {
            return res.status(404).json({ message: 'Certificate not found.' });
        }

        if(certificate.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this certificate.' });
        }

        await Certificate.findByIdAndDelete(req.params.id);
        res.json({ message: 'Certificate deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCertificatesByModule = async (moduleId) => {
    try {
        await Certificate.deleteMany({ moduleId });
    } catch (error) {
        console.error('Error deleting certificates for module:', error);
    }
};

module.exports = {
    getCertificates,
    createCertificate,
    deleteCertificate,
    deleteCertificatesByModule
};
