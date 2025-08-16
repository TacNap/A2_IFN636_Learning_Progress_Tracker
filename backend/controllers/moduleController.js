const Module = require('../models/Module');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

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

    if (module.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this module' });
    }

    const previousCompletedLessons = module.completedLessons;

    module.title = title || module.title;
    module.description = description || module.description;
    module.completed = completed ?? module.completed;
    module.deadline = deadline || module.deadline;
    
    if (totalLessons !== undefined) {
      const parsedTotalLessons = parseInt(totalLessons, 10);
      if (isNaN(parsedTotalLessons) || parsedTotalLessons < 0) {
        return res.status(400).json({ message: 'Total lessons must be a valid positive number' });
      }
      module.totalLessons = parsedTotalLessons;
      
      if (module.completedLessons > parsedTotalLessons) {
        module.completedLessons = parsedTotalLessons;
      }
    }
    
    if (completedLessons !== undefined) {
      const parsedCompletedLessons = parseInt(completedLessons, 10);
      if (isNaN(parsedCompletedLessons) || parsedCompletedLessons < 0) {
        return res.status(400).json({ message: 'Completed lessons must be a valid positive number' });
      }
      module.completedLessons = parsedCompletedLessons;
    }
    
    const updatedModule = await module.save();

    await handleCertificateCreation(
      updatedModule,
      req.user.id,
      previousCompletedLessons,
      updatedModule.completedLessons
    );

    res.json(updatedModule);
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
      return res.status(403).json({ message: 'Not authorized to update this module' });
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
        message: `Only ${module.totalLessons} lessons in this module` 
      });
    }
    
    module.completedLessons = newCompletedLessons;
    const updatedModule = await module.save();

    const certificateResult = await handleCertificateCreation(
      updatedModule,
      req.user.id,
      previousCompletedLessons,
      newCompletedLessons
    );

    const response = {
      module: updatedModule,
      certificateEarned: certificateResult.certificateEarned
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handleCertificateCreation = async (module, userId, previousCompletedLessons, newCompletedLessons) => {
  let certificateEarned = false;

  try {
    const { totalLessons } = module;
    
    if (previousCompletedLessons < totalLessons && newCompletedLessons === totalLessons && totalLessons > 0) {
      const user = await User.findById(userId);
      if (user) {
        const existingCertificate = await Certificate.findOne({
          userId: user._id,
          moduleId: module._id
        });

        if (!existingCertificate) {
          await Certificate.create({
            userId: user._id,
            moduleId: module._id,
            moduleName: module.title,
            userName: user.name,
            totalLessons: module.totalLessons
          });
          certificateEarned = true;
          console.log(`Certificate created for user ${user.name} for module ${module.title}`);
        }
      }
    }
  } catch (error) {
    console.error('Error creating certificate:', error);  
  }
  
  return { certificateEarned };
};

const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    
    if (module.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this module' });
    }
    
    await Certificate.deleteMany({ moduleId: req.params.id });
    
    await Module.findByIdAndDelete(req.params.id);
    res.json({ message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getModules, addModule, updateModule, deleteModule, updateLessons };