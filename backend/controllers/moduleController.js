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

    const previousCompletedLessons = module.completedLessons;

    module.title = title || module.title;
    module.description = description || module.description;
    module.completed = completed ?? module.completed;
    module.deadline = deadline || module.deadline;
    
    if (totalLessons !== undefined) {
      module.totalLessons = totalLessons;
      if (module.completedLessons > totalLessons) {
        module.completedLessons = totalLessons;
      }
    }
    
    if (completedLessons !== undefined) {
      module.completedLessons = completedLessons;
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

    const previousCompletedLessons = module.completedLessons;
    const newCompletedLessons = module.completedLessons + increment;
    
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

  try{
    const { totalLessons } = module;
    if (previousCompletedLessons < totalLessons && newCompletedLessons === totalLessons && totalLessons > 0) {
      const user = await User.findById(userId);
      if (user) {
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


  } catch (error) {
    console.error('Error creating certificate:', error);  
  }
  return { certificateEarned };
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