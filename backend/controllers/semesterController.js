const semesterOperation = require('../operations/semesterOperation');
const Semester = require('../models/Semester');

const getSemesters = async (req, res) => {
  try {
    const semesters = await semesterOperation.getSemesters({ userId: req.user.id });
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addSemester = async (req, res) => {
  const { number, startDate, endDate, modules } = req.body;
  try {
    const semester = await semesterOperation.createSemester({
      userId: req.user.id,
      number,
      startDate,
      endDate,
      modules,
    });
    res.status(201).json(semester);
  } catch (error) {
    const status = error.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

const updateSemester = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    if (semester.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorised to update this semester' });
    }

    const updated = await semesterOperation.updateSemester(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    const status = error.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

const deleteSemester = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    if (semester.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorised to delete this semester' });
    }

    await semesterOperation.deleteSemester(req.params.id);
    res.json({ message: 'Semester deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSemesters,
  addSemester,
  updateSemester,
  deleteSemester,
};
