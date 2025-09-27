const Module = require('../models/Module');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

class ModuleOperation {
	async createModule(data) {
		const { userId, title, description, deadline, totalLessons } = data || {};

		if (!userId) {
			const err = new Error('userId is required');
			err.name = 'ValidationError';
			throw err;
		}
		if (!title) {
			const err = new Error('title is required');
			err.name = 'ValidationError';
			throw err;
		}

		let tl = 0;
		if (totalLessons !== undefined) {
			const parsed = parseInt(totalLessons, 10);
			if (isNaN(parsed) || parsed < 0) {
				const err = new Error('Total lessons must be a valid positive number');
				err.name = 'ValidationError';
				throw err;
			}
			tl = parsed;
		}

		const module = await Module.create({
			userId,
			title,
			description,
			deadline,
			totalLessons: tl,
			completedLessons: 0,
		});

		return module;
	}
	
	async getModules(filter = {}) {
		return Module.find(filter);
	}
	
	async GetModuleById(id) {
		return Module.findById(id);
	}
	
	async UpdateModule(id, data) {
		const module = await Module.findById(id);
		if (!module) return null;

		const previousCompletedLessons = module.completedLessons;

		const { title, description, completed, deadline, totalLessons, completedLessons } = data || {};

		module.title = title || module.title;
		module.description = description || module.description;
		module.completed = (completed ?? module.completed);
		module.deadline = deadline || module.deadline;

		if (totalLessons !== undefined) {
			const parsedTotal = parseInt(totalLessons, 10);
			if (isNaN(parsedTotal) || parsedTotal < 0) {
				const err = new Error('Total lessons must be a valid positive number');
				err.name = 'ValidationError';
				throw err;
			}
			module.totalLessons = parsedTotal;
			if (module.completedLessons > parsedTotal) {
				module.completedLessons = parsedTotal;
			}
		}

		if (completedLessons !== undefined) {
			const parsedCompleted = parseInt(completedLessons, 10);
			if (isNaN(parsedCompleted) || parsedCompleted < 0) {
				const err = new Error('Completed lessons must be a valid positive number');
				err.name = 'ValidationError';
				throw err;
			}
			module.completedLessons = parsedCompleted;
		}

		const updatedModule = await module.save();

		const { certificateEarned } = await this.handleCertificateCreation(
			updatedModule,
			previousCompletedLessons,
			updatedModule.completedLessons
		);

		return { module: updatedModule, certificateEarned };
	}

	async handleCertificateCreation(module, previousCompletedLessons, newCompletedLessons) {
		let certificateEarned = false;
		try {
			const { totalLessons } = module;
			if (
				previousCompletedLessons < totalLessons &&
				newCompletedLessons === totalLessons &&
				totalLessons > 0
			) {
				const user = await User.findById(module.userId);
				if (user) {
					const existingCertificate = await Certificate.findOne({
						userId: user._id,
						moduleId: module._id,
					});
					if (!existingCertificate) {
						await Certificate.create({
							userId: user._id,
							moduleId: module._id,
							moduleName: module.title,
							userName: user.name,
							totalLessons: module.totalLessons,
						});
						certificateEarned = true;
					}
				}
			}
		} catch (error) {
			console.error('Error creating certificate:', error);
		}
		return { certificateEarned };
	}
}

module.exports = new ModuleOperation();
