const { Schema, model } = require('mongoose')
const { CollectionNames } = require('../../utils/constants')

const documentSchema = new Schema(
	{
		type: {
			type: String,
			default: 'tarixiy',
			enum: ['tarixiy', 'zamonaviy'],
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		desc: {
			type: String,
			trim: true,
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

const DictionaryModel = model(
	CollectionNames.DICTIONARY,
	documentSchema,
	CollectionNames.DICTIONARY
) 

module.exports = { DictionaryModel }
