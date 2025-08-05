const { SaveFileModel } = require('../models/save-file/save-file.model')
const { deleteFileS3 } = require('./s3.js')

const deleteFile = async saveFile => {
	if (!saveFile) return

	if (saveFile) {
		await deleteFileS3(saveFile.file_path)
		await SaveFileModel.deleteOne(saveFile)
	}
}

module.exports = { deleteFile }
