const { StatusCodes } = require('http-status-codes')
const { SaveFileModel } = require('../../models/save-file/save-file.model.js')
const { HttpException } = require('../../utils/http-exception.js')
const { uploadFileS3, deleteFileS3 } = require('../../utils/s3.js')
const { v4 } = require('uuid')
const path = require('path')

class UploadController {
	static uploadFile = async (req, res) => {
		const uploadFile = req.file
		if (!uploadFile) {
			throw new HttpException(StatusCodes.NOT_FOUND, 'File not found')
		}

		let file_name = 'Dictionary/' + v4() + path.extname(uploadFile.originalname)

		if (uploadFile.mimetype.startsWith('image/')) {
			file_name = 'Dictionary/images/' + v4() + path.extname(uploadFile.originalname)
		}

		if (uploadFile.mimetype.startsWith('audio/')) {
			file_name = 'Dictionary/audio/' + v4() + path.extname(uploadFile.originalname)
		}

		if (uploadFile.mimetype.startsWith('video/')) {
			file_name = 'Dictionary/videos/' + v4() + path.extname(uploadFile.originalname)
		}

		const file_path = await uploadFileS3(file_name, uploadFile.buffer)

		await SaveFileModel.create({
			file_path,
			is_use: false,
		})

		res.status(StatusCodes.CREATED).json({
			success: true,
			file_path,
		})
	}

	static deleteFileWithCron = async () => {
		try {
			const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
			const files = await SaveFileModel.find(
				{ is_use: false, createdAt: { $lt: oneDayAgo } },
				null,
				{ lean: true }
			)

			for (const file of files) {
				await deleteFileS3(file.file_path)
				await SaveFileModel.deleteOne({ file_path: file.file_path })
			}

			return files.length.toString()
		} catch (error) {
			console.error('Error deleting files with cron:', error)
			return 'Not deleted files with "Cron job"'
		}
	}

}

module.exports = { UploadController }
