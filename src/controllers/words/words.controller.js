const { SectionModel } = require('../../models/section/section.model.js')
const { CategoryModel } = require('../../models/category/category.model.js')
const { HttpException } = require('../../utils/http-exception.js')
const { StatusCodes } = require('http-status-codes')
const { WordsModel } = require('../../models/words/words.model.js')
const { deleteFile } = require('../../utils/delete-file.js')
const { SaveFileModel } = require('../../models/save-file/save-file.model.js')
const { DictionaryModel } = require('../../models/dictionary/dictionary.model.js')

class WordsController {
	static getAll = async (req, res) => {
		const { search, related_dic, related_sec, related_cat } = req.query

		const parsedLimit = parseInt(req.query.limit) || 10
		const parsedPage = parseInt(req.query.page) || 1

		const filter = {}

		if (related_dic?.trim()) {
			filter.related_dic = related_dic.trim()
		}

		if (related_sec?.trim()) {
			filter.related_sec = related_sec.trim()
		}

		if (related_cat?.trim()) {
			filter.related_cat = related_cat.trim()
		}

		let searchQuery = filter

		if (search?.trim()) {
			const searchRegex = { $regex: search.trim(), $options: 'i' }

			const textSearch = {
				$or: [{ name: searchRegex }, { desc: searchRegex }],
			}

			if (Object.keys(filter).length > 0) {
				searchQuery = {
					$and: [filter, textSearch],
				}
			} else {
				searchQuery = textSearch
			}
		}

		const allWords = await WordsModel.find(searchQuery)
			.skip((parsedPage - 1) * parsedLimit)
			.limit(parsedLimit)
			.populate('related_dic', 'name type -_id')
			.populate('related_sec', 'name -_id')
			.populate('related_cat', 'name -_id')

		const totalCount = await WordsModel.countDocuments(searchQuery)

		res.status(StatusCodes.OK).json({
			success: true,
			data: allWords,
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
		const { id } = req.params;
		const word = await WordsModel.findById(id)
			.populate('related_dic', 'name type -_id')
			.populate('related_sec', 'name -_id')
			.populate('related_cat', 'name -_id');

		if (!word) {
			throw new HttpException(StatusCodes.NOT_FOUND, 'Word not found');
		}

		res.status(StatusCodes.OK).json({
			success: true,
			data: word,
		});
	}
	
	static add = async (req, res) => {
		const { name, desc, related_dic, related_sec, related_cat, image } =
			req.body

		const existingWord = await WordsModel.findOne({
			name: { $regex: `^${name}$`, $options: 'i' },
		})
		if (existingWord) {
			throw new HttpException(
				StatusCodes.CONFLICT,
				`Name: <<${name}>> already exists`
			)
		}

		let dictionary = null
		if (related_dic) {
			dictionary = await DictionaryModel.findById(related_dic)
			if (!dictionary) {
				throw new HttpException(StatusCodes.NOT_FOUND, 'Dictionary not found')
			}
		}

		let section = null
		if (related_sec) {
			section = await SectionModel.findById(related_sec)
			if (!section) {
				throw new HttpException(StatusCodes.NOT_FOUND, 'Section not found')
			}
		}

		let category = null
		if (related_cat) {
			category = await CategoryModel.findById(related_cat)
			if (!category) {
				throw new HttpException(StatusCodes.NOT_FOUND, 'Category not found')
			}
		}

		const save_fil = await SaveFileModel.findOne({ file_path: image })

		if (save_fil) {
			await save_fil.updateOne({ is_use: true })
		}

		const newWord = await WordsModel.create({
			name: name.trim(),
			desc: desc.trim(),
			related_dic: dictionary?._id || null,
			related_sec: section?._id || null,
			related_cat: category?._id || null,
			image,
		})

		res.status(StatusCodes.CREATED).json({
			success: true,
			msg: 'Word added successfully',
			data: newWord,
		})
	}

	static update = async (req, res) => {
		const { id } = req.params
		const { name, desc, related_dic, related_sec, related_cat, image } =
			req.body

		const oldWord = await WordsModel.findById(id)
		if (!oldWord) {
			throw new HttpException(StatusCodes.NOT_FOUND, 'Word not found')
		}

		const updateWord = {}

		if (name && name.trim().toLowerCase() !== oldWord.name.toLowerCase()) {
			const nameExists = await WordsModel.findOne({
				name: { $regex: `^${name.trim()}$`, $options: 'i' },
				_id: { $ne: id },
			})
			if (nameExists) {
				throw new HttpException(StatusCodes.CONFLICT, 'Name already exists')
			}
			updateWord.name = name.trim()
		}

		if (desc && desc.trim() !== oldWord.desc) {
			updateWord.desc = desc.trim()
		}

		if (
			related_dic &&
			related_dic.toString() !== oldWord.related_dic?.toString()
		) {
			const dictionary = await DictionaryModel.findById(related_dic)
			if (!dictionary) {
				throw new HttpException(StatusCodes.NOT_FOUND, 'Dictionary not found')
			}
			updateWord.related_dic = dictionary._id
		}

		if (
			related_sec &&
			related_sec.toString() !== oldWord.related_sec?.toString()
		) {
			const section = await SectionModel.findById(related_sec)
			if (!section) {
				throw new HttpException(StatusCodes.NOT_FOUND, 'Section not found')
			}
			updateWord.related_sec = section._id
		}

		if (
			related_cat &&
			related_cat.toString() !== oldWord.related_cat?.toString()
		) {
			const category = await CategoryModel.findById(related_cat)
			if (!category) {
				throw new HttpException(StatusCodes.NOT_FOUND, 'Category not found')
			}
			updateWord.related_cat = category._id
		}

		if (image && image !== oldWord.image) {
			const save_file = await SaveFileModel.findOne({ file_path: image })
			if (!save_file) {
				throw new HttpException(
					StatusCodes.UNPROCESSABLE_ENTITY,
					'Image not found'
				)
			}
			updateWord.image = image
		}

		if (image && image !== oldWord.image) {
			await SaveFileModel.updateOne(
				{ file_path: oldWord.image },
				{ is_use: false }
			)
			await SaveFileModel.updateOne({ file_path: image }, { is_use: true })
		}

		if (Object.keys(updateWord).length > 0) {
			await WordsModel.findByIdAndUpdate(id, updateWord, { new: true })
		}

		res.status(StatusCodes.OK).json({
			success: true,
			msg: 'Word updated successfully',
			data: await WordsModel.findById(id),
		})
	}

	static delete = async (req, res) => {
		const { id } = req.params

		const word = await WordsModel.findById(id)
		if (!word) {
			throw new HttpException(StatusCodes.NOT_FOUND, 'Word not found')
		}

		const saveFile = await SaveFileModel.findOne({
			file_path: word.image,
		})

		if (saveFile) {
			await deleteFile(saveFile)
		}

		await word.deleteOne()

		res.status(StatusCodes.OK).json({
			success: true,
			msg: 'Word deleted successfully',
		})
	}
}

module.exports = { WordsController }
