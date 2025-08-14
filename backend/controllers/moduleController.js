const Module = require('../models/Module');

const getModules = async (req, res) => {
  try {
    const modules = await Module.find({ userId: req.user.id });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addModule = async (req, res) => {
  const { title, description, deadline, totalLessons } = req.body;
  try {
    const module = await Module.create({ 
      userId: req.user.id, 
      title, 
      description, 
      deadline,
      totalLessons: totalLessons || 0,
      completedLessons: 0
    });
    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateModule = async (req, res) => {
  const { title, description, completed, deadline, totalLessons, completedLessons } = req.body;
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    
    // Update fields
    module.title = title || module.title;
    module.description = description || module.description;
    module.completed = completed ?? module.completed;
    module.deadline = deadline || module.deadline;
    
    // Handle lesson updates
    if (totalLessons !== undefined) {
      module.totalLessons = totalLessons;
      // If totalLessons is reduced below completedLessons, adjust completedLessons
      if (module.completedLessons > totalLessons) {
        module.completedLessons = totalLessons;
      }
    }
    
    if (completedLessons !== undefined) {
      module.completedLessons = completedLessons;
    }
    
    const updatedModule = await module.save();
    res.json(updatedModule);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// New function to increment/decrement lessons
const updateLessons = async (req, res) => {
  const { increment } = req.body; // +1 or -1
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    
    const newCompletedLessons = module.completedLessons + increment;
    
    // Validation
    if (newCompletedLessons < 0) {
      return res.status(400).json({ message: 'Cannot have negative completed lessons' });
    }
    
    if (newCompletedLessons > module.totalLessons) {
      return res.status(400).json({ 
        message: `Only ${module.totalLessons} lessons in this module` 
      });
    }
    
    module.completedLessons = newCompletedLessons;
    const updatedModule = await module.save();
    res.json(updatedModule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    
    await Module.findByIdAndDelete(req.params.id);
    res.json({ message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getModules, addModule, updateModule, deleteModule, updateLessons };