const { DictionaryModel } = require('../../models/dictionary/dictionary.model.js')
const { deleteFile } = require('../../utils/delete-file.js')
const { HttpException } = require('../../utils/http-exception.js')
const { StatusCodes } = require('http-status-codes')
const { SaveFileModel } = require('../../models/save-file/save-file.model.js')
const { uploadFileS3 } = require('../../utils/s3.js')

class DictionaryController {
	static getAll = async (req, res) => {
		const { search, type } = req.query

		const parsedLimit = parseInt(req.query.limit) || 10
		const parsedPage = parseInt(req.query.page) || 1

		let searchQuery = {}

		if (type && type.trim().length > 0) {
			searchQuery.type = type.trim()
		}

		if (search && search.trim().length > 0) {
			const textSearch = {
				$or: [
					{ name: { $regex: search.trim(), $options: 'i' } },
					{ desc: { $regex: search.trim(), $options: 'i' } },
				],
			}

			if (Object.keys(searchQuery).length > 0) {
				searchQuery = {
					$and: [searchQuery, textSearch],
				}
			} else {
				searchQuery = textSearch
			}
		}

		const allDictionary = await DictionaryModel.find(searchQuery)
			.skip((parsedPage - 1) * parsedLimit)
			.limit(parsedLimit)

		const totalCount = await DictionaryModel.countDocuments(searchQuery)

		res.status(StatusCodes.OK).json({
			success: true,
			data: allDictionary,
			pagination: {
				currentPage: parsedPage,
				totalCount,
				limit: parsedLimit,
				totalPage: Math.ceil(totalCount / parsedLimit),
				hasNextPage: totalCount > parsedPage * parsedLimit,
				hasPrevPage: parsedPage > 1,
			},
		})
	}

	static getById = async (req, res) => {
		const { id } = req.params
		const dictionary = await DictionaryModel.findById(id)
		if (!dictionary) {
			throw new HttpException(StatusCodes.NOT_FOUND, 'Dictionary not found')
		}
		res.status(StatusCodes.OK).json({
			success: true,
			data: dictionary,
		})
	}

	static add = async (req, res) => {
		const { type, name, desc } = req.body;
		let image = req.body.image;
		console.log(req.body, req.file)
		// If file uploaded via form-data, upload to S3
		if (req.file) {
			// Generate unique key for S3
			const ext = req.file.originalname.split('.').pop();
			const key = `dictionary/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
			// Upload to S3
			const s3Url = await uploadFileS3(key, req.file.buffer);
			if (!s3Url) {
				throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Image upload failed');
			}
			image = s3Url;
		}

		const existingDictionary = await DictionaryModel.findOne({ name });
		if (existingDictionary) {
			throw new HttpException(
				StatusCodes.CONFLICT,
				`Name: <<${name}>> already exists`
			);
		}

		let save_fil = null;
		if (image) {
			save_fil = await SaveFileModel.findOne({ file_path: image });
			if (save_fil) {
				await save_fil.updateOne({ is_use: true });
			}
		}

		const newDictionary = await DictionaryModel.create({
			type,
			name,
			desc,
			image,
		});

		res.status(StatusCodes.CREATED).json({
			success: true,
			msg: 'Dictionary added successfully',
			data: newDictionary,
		});
	}

	static update = async (req, res) => {
		const { id } = req.params
		const { type, name, desc, image } = req.body

		const oldDictionary = await DictionaryModel.findById(id)
		if (!oldDictionary) {
			throw new HttpException(StatusCodes.NOT_FOUND, 'Dictionary not found')
		}

		const updateDictionary = {}

		if (image && image !== oldDictionary.image) {
			const save_file = await SaveFileModel.findOne({ file_path: image })
			if (!save_file) {
				throw new HttpException(
					StatusCodes.UNPROCESSABLE_ENTITY,
					'Image not found'
				)
			}
			updateDictionary.image = image
		}

		if (type && type !== oldDictionary.type) {
			updateDictionary.type = type
		}
		if (name && name !== oldDictionary.name) {
			updateDictionary.name = name
		}
		if (desc && desc !== oldDictionary.desc) {
			updateDictionary.desc = desc
		}

		if (Object.keys(updateDictionary).length > 0) {
			await DictionaryModel.findByIdAndUpdate(id, updateDictionary)
		}

		if (image && image !== oldDictionary.image) {
			await SaveFileModel.updateOne(
				{ file_path: oldDictionary.image },
				{ is_use: false }
			)
			await SaveFileModel.updateOne({ file_path: image }, { is_use: true })
		}

		res
			.status(StatusCodes.OK)
			.json({ success: true, msg: 'Dictionary updated successfully' })
	}

	static delete = async (req, res) => {
		const { id } = req.params

		const dictionary = await DictionaryModel.findById(id)
		if (!dictionary) {
			throw new HttpException(StatusCodes.NOT_FOUND, 'Dictionary not found')
		}

		const saveFile = await SaveFileModel.findOne({
			file_path: dictionary.image,
		})

		if (saveFile) {
			await deleteFile(saveFile)
		}

		await dictionary.deleteOne()

		res.status(StatusCodes.OK).json({
			success: true,
			msg: 'Dictionary deleted successfully',
		})
	}
}

module.exports = { DictionaryController }
