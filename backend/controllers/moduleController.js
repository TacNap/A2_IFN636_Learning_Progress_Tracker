const Module = require('../models/Module');
const Certificate = require('../models/Certificate');
const moduleOperation = require('../operations/moduleOperation');

const getModules = async (req, res) => {
  try {
    const modules = await moduleOperation.getModules({ userId: req.user.id });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addModule = async (req, res) => {
  const { title, description, deadline, totalLessons } = req.body;
  try {
    const module = await moduleOperation.createModule({
      userId: req.user.id,
      title,
      description,
      deadline,
      totalLessons,
    });
    res.status(201).json(module);
  } catch (error) {
    const status = error.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

const updateModule = async (req, res) => {
  const { title, description, completed, deadline, totalLessons, completedLessons } = req.body;
  try {
    const found = await Module.findById(req.params.id);
    if (!found) return res.status(404).json({ message: 'Module not found' });

    if (found.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorised to update this module' });
    }

    const result = await moduleOperation.UpdateModule(req.params.id, {
      title,
      description,
      completed,
      deadline,
      totalLessons,
      completedLessons,
    });

    res.json(result.module);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

const updateLessons = async (req, res) => {
  const { increment } = req.body;
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    if (module.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorised to update this module' });
    }

    const parsedIncrement = parseInt(increment, 10);
    if (isNaN(parsedIncrement)) {
      return res.status(400).json({ message: 'Increment must be a valid number' });
    }

    const previousCompletedLessons = module.completedLessons;
    const newCompletedLessons = module.completedLessons + parsedIncrement;
    
    if (newCompletedLessons < 0) {
      return res.status(400).json({ message: 'Cannot have negative completed lessons' });
    }
    
    if (newCompletedLessons > module.totalLessons) {
      return res.status(400).json({ 
        message: 'Only lessons in this module'
      });
    }

    const result = await moduleOperation.UpdateModule(req.params.id, { completedLessons: newCompletedLessons });

    const response = {
      module: result.module,
      certificateEarned: result.certificateEarned,
    };

    res.json(response);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    
    if (module.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorised to delete this module' });
    }
    
    await Certificate.deleteMany({ moduleId: req.params.id });
    
    await Module.findByIdAndDelete(req.params.id);
    res.json({ message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getModules, addModule, updateModule, deleteModule, updateLessons };

