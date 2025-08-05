const e = require('cors')
const { Schema, model } = require('mongoose')
const { CollectionNames } = require('../../utils/constants')

const documentSchema = new Schema(
	{
		file_path: {
			type: String,
			required: true,
		},
		is_use: {
			type: Boolean,
			required: true,
			default: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

const SaveFileModel = model(
	CollectionNames.SAVE_FILE,
	documentSchema,
	CollectionNames.SAVE_FILE
)

module.exports = { SaveFileModel }
