const { Schema, model } = require('mongoose')
const { CollectionNames } = require('../../utils/constants')

const documentSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		related_dic: {
			type: Schema.Types.ObjectId,
			ref: CollectionNames.DICTIONARY,
		},
		image: {
			type: String,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

const SectionModel = model(
	CollectionNames.SECTION,
	documentSchema,
	CollectionNames.SECTION
) 

module.exports = { SectionModel }
