const { Schema, model } = require('mongoose')
const { CollectionNames } = require('../../utils/constants')

const documentSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		desc: {
			type: String,
		},
		related_sec: {
			type: Schema.Types.ObjectId,
			ref: CollectionNames.SECTION,
		},
		related_dic: {
			type: Schema.Types.ObjectId,
			ref: CollectionNames.DICTIONARY,
		},
		related_cat: {
			type: Schema.Types.ObjectId,
			ref: CollectionNames.CATEGORY,
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

const WordsModel = model(
	CollectionNames.WORDS,
	documentSchema,
	CollectionNames.WORDS
)

module.exports = { WordsModel }
