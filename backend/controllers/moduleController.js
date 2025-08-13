const Task = require('../models/Module');
const getModules = async (
req,
res) => {
try {
const modules = await Module.find({ userId: req.user.id });
res.json(modules);
} catch (error) {
res.status(500).json({ message: error.message });
}
};

const addModule = async (
req,
res) => {
const { title, description, deadline } = req.body;
try {
const module = await Module.create({ userId: req.user.id, title, description, deadline });
res.status(201).json(module);
} catch (error) {
res.status(500).json({ message: error.message });
}
};


const updateModule = async (
req,
res) => {
const { title, description, completed, deadline } = req.body;
try {
const module = await Module.findById(req.params.id);
if (!module) return res.status(404).json({ message: 'Module not found' });
module.title = title || module.title;
module.description = description || module.description;
module.completed = completed ?? module.completed;
module.deadline = deadline || module.deadline;
const updatedModule = await module.save();
res.json(updatedModule);
} catch (error) {
res.status(500).json({ message: error.message });
}
};


const deleteModule = async (
req,
res) => {
try {
const module = await Module.findById(req.params.id);
if (!module) return res.status(404).json({ message: 'Module not found' });
await module.remove();
res.json({ message: 'Module deleted' });
} catch (error) {
res.status(500).json({ message: error.message });
}
};
module.exports = { getModules, addModule, updateModule, deleteModule }

//this better work