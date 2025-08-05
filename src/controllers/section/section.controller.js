const { SectionModel } = require('../../models/section/section.model.js')
const { HttpException } = require('../../utils/http-exception.js')
const { StatusCodes } = require('http-status-codes')
const { SaveFileModel } = require('../../models/save-file/save-file.model.js')
const { deleteFile } = require('../../utils/delete-file.js')
const { DictionaryModel } = require('../../models/dictionary/dictionary.model.js')
const multer = require('multer');
const upload = multer();

class SectionController {
	static getAll = async (req, res) => {
		const { search, related_dic } = req.query

		const parsedLimit = parseInt(req.query.limit) || 10
		const parsedPage = parseInt(req.query.page) || 1

		let searchQuery = {}

		if (related_dic && related_dic.trim().length > 0) {
			searchQuery.related_dic = related_dic.trim()
		}

		if (search && search.trim().length > 0) {
			const textSearch = {
				$or: [{ name: { $regex: search.trim(), $options: 'i' } }],
			}

			if (Object.keys(searchQuery).length > 0) {
				searchQuery = {
					$and: [searchQuery, textSearch],
				}
			} else {
				searchQuery = textSearch
			}
		}

		const allSection = await SectionModel.find(searchQuery)
			.skip((parsedPage - 1) * parsedLimit)
			.limit(parsedLimit)
			.populate('related_dic', 'name type -_id')

		const totalCount = await SectionModel.countDocuments(searchQuery)

		res.status(StatusCodes.OK).json({
			success: true,
			data: allSection,
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
		if (!id) {
			throw new HttpException(StatusCodes.BAD_REQUEST, 'Section ID is required')
		}
		const section = await SectionModel.findById(id).populate(
			'related_dic',
			'name type -_id'
		)
		if (!section) {
			throw new HttpException(StatusCodes.NOT_FOUND, 'Section not found')
		}
		res.status(StatusCodes.OK).json({
			success: true,
			data: section,
		})
	}

	static add = async (req, res) => {
		const { name, related_dic, image } = req.body

		const existingSection = await SectionModel.findOne({ name })
		if (existingSection) {
			throw new HttpException(
				StatusCodes.CONFLICT,
				`Name: <<${name}>> already exists`
			)
		}

		const dictionary = await DictionaryModel.findById(related_dic)

		const save_fil = await SaveFileModel.findOne({ file_path: image })

		if (save_fil) {
			await save_fil.updateOne({ is_use: true })
		}

		const newSection = await SectionModel.create({
			name,
			related_dic: dictionary ? dictionary._id : null,
			image,
		})

		res.status(StatusCodes.CREATED).json({
			success: true,
			msg: 'Section added successfully',
			data: newSection,
		})
	}

	static getByDictionary = async (req, res) => {
		const { id } = req.params

		if (!id) {
			throw new HttpException(
				StatusCodes.BAD_REQUEST,
				'Dictionary ID is required'
			)
		}

		const sections = await SectionModel.find({ related_dic: id }).populate(
			'related_dic',
			'name type -_id'
		)

		res.status(StatusCodes.OK).json({
			success: true,
			msg: 'Sections fetched successfully',
			data: sections,
		})
	}

	static update = async (req, res) => {
		const { id } = req.params
		const { name, related_dic, image } = req.body

		const oldSection = await SectionModel.findById(id)
		if (!oldSection) {
			throw new HttpException(StatusCodes.NOT_FOUND, 'Section not found')
		}

		const updateSection = {}

		if (image && image !== oldSection.image) {
			const save_file = await SaveFileModel.findOne({ file_path: image })
			if (!save_file) {
				throw new HttpException(
					StatusCodes.UNPROCESSABLE_ENTITY,
					'Image not found'
				)
			}
			updateSection.image = image
		}

		if (name && name !== oldSection.name) {
			updateSection.name = name
		}

		if (
			related_dic &&
			related_dic.toString() !== oldSection.related_dic?.toString()
		) {
			const dictionary = await DictionaryModel.findById(related_dic)
			if (!dictionary) {
				throw new HttpException(StatusCodes.NOT_FOUND, 'Dictionary not found')
			}
			updateSection.related_dic = dictionary._id
		}

		if (Object.keys(updateSection).length > 0) {
			await SectionModel.findByIdAndUpdate(id, updateSection)
		}

		if (image && image !== oldSection.image) {
			await SaveFileModel.updateOne(
				{ file_path: oldSection.image },
				{ is_use: false }
			)
			await SaveFileModel.updateOne({ file_path: image }, { is_use: true })
		}

		res.status(StatusCodes.OK).json({
			success: true,
			msg: 'Section updated successfully',
		})
	}

	static delete = async (req, res) => {
		const { id } = req.params

		const section = await SectionModel.findById(id)
		if (!section) {
			throw new HttpException(StatusCodes.NOT_FOUND, 'Section not found')
		}

		const saveFile = await SaveFileModel.findOne({
			file_path: section.image,
		})

		if (saveFile) {
			await deleteFile(saveFile)
		}

		await section.deleteOne()

		res.status(StatusCodes.OK).json({
			success: true,
			msg: 'Section deleted successfully',
		})
	}
}

module.exports = { SectionController }
