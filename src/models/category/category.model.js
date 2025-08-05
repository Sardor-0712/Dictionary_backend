const { Schema, model } = require('mongoose')
const { CollectionNames } = require('../../utils/constants')

const documentSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		related_sec: {
			type: Schema.Types.ObjectId,
			ref: CollectionNames.SECTION,
		},
		related_dic: {
			type: Schema.Types.ObjectId,
			ref: CollectionNames.DICTIONARY,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

const CategoryModel = model(
	CollectionNames.CATEGORY,
	documentSchema,
	CollectionNames.CATEGORY
)

module.exports = { CategoryModel }
