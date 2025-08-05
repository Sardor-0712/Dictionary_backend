const { StatusCodes } = require('http-status-codes')
const { CategoryModel } = require('../../models/category/category.model.js')
const { SectionModel } = require('../../models/section/section.model.js')
const { isValidObjectId } = require('../../utils/delete-file.js')
const { DictionaryModel } = require('../../models/dictionary/dictionary.model.js')
const { HttpException } = require('../../utils/http-exception.js')

class CategoryController {

	static getAll = async (req, res) => {
		const { search, related_dic, related_sec } = req.query

		const parsedLimit = parseInt(req.query.limit) || 10
		const parsedPage = parseInt(req.query.page) || 1

		const filter = {}

		if (related_dic?.trim()) {
			filter.related_dic = related_dic.trim()
		}

		if (related_sec?.trim()) {
			filter.related_sec = related_sec.trim()
		}

		let searchQuery = filter

		if (search?.trim()) {
			const searchRegex = { $regex: search.trim(), $options: 'i' }

			const textSearch = {
				$or: [{ name: searchRegex }],
			}

			if (Object.keys(filter).length > 0) {
				searchQuery = {
					$and: [filter, textSearch],
				}
			} else {
				searchQuery = textSearch
			}
		}

		const allCategory = await CategoryModel.find(searchQuery)
			.skip((parsedPage - 1) * parsedLimit)
			.limit(parsedLimit)
			.populate('related_dic', 'name type -_id')
			.populate('related_sec', 'name -_id')

		const totalCount = await CategoryModel.countDocuments(searchQuery)

		res.status(StatusCodes.OK).json({
			success: true,
			data: allCategory,
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
		if (!isValidObjectId(id)) {
			throw new HttpException(StatusCodes.BAD_REQUEST, 'Invalid category ID')
		}
		const category = await CategoryModel.findById(id)
			.populate('related_dic', 'name type -_id')
			.populate('related_sec', 'name -_id')
		if (!category) {
			throw new HttpException(StatusCodes.NOT_FOUND, 'Category not found')
		}
		res.status(StatusCodes.OK).json({
			success: true,
			data: category,
		})
	}
	static getBySection = async (req, res) => {
		const { id } = req.params;

		if (!id || id.length !== 24) {
			return res.status(400).json({ success: false, msg: 'Section ID is required' });
		}

		const categories = await CategoryModel.find({ related_sec: id });

		res.status(200).json({ success: true, data: categories });
	}


	static add = async (req, res) => {
		const { name, related_dic, related_sec } = req.body

		const existingCategory = await CategoryModel.findOne({
			name: { $regex: `^${name}$`, $options: 'i' },
		})
		if (existingCategory) {
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

		const newCategory = await CategoryModel.create({
			name: name.trim(),
			related_dic: dictionary?._id || null,
			related_sec: section?._id || null,
		})

		res.status(StatusCodes.CREATED).json({
			success: true,
			msg: 'Category added successfully',
			data: newCategory,
		})
	}

	static update = async (req, res) => {
		const { id } = req.params
		const { name, related_dic, related_sec } = req.body

		const oldCategory = await CategoryModel.findById(id)
		if (!oldCategory) {
			throw new HttpException(StatusCodes.NOT_FOUND, 'Category not found')
		}

		const updateCategory = {}

		if (name && name.trim().toLowerCase() !== oldCategory.name.toLowerCase()) {
			const nameExists = await CategoryModel.findOne({
				name: { $regex: `^${name.trim()}$`, $options: 'i' },
				_id: { $ne: id },
			})
			if (nameExists) {
				throw new HttpException(StatusCodes.CONFLICT, 'Name already exists')
			}
			updateCategory.name = name.trim()
		}

		if (
			related_dic &&
			related_dic.toString() !== oldCategory.related_dic?.toString()
		) {
			const dictionary = await DictionaryModel.findById(related_dic)
			if (!dictionary) {
				throw new HttpException(StatusCodes.NOT_FOUND, 'Dictionary not found')
			}
			updateCategory.related_dic = dictionary._id
		}

		if (
			related_sec &&
			related_sec.toString() !== oldCategory.related_sec?.toString()
		) {
			const section = await SectionModel.findById(related_sec)
			if (!section) {
				throw new HttpException(StatusCodes.NOT_FOUND, 'Section not found')
			}
			updateCategory.related_sec = section._id
		}

		if (Object.keys(updateCategory).length > 0) {
			await CategoryModel.findByIdAndUpdate(id, updateCategory)
		}

		res.status(StatusCodes.OK).json({
			success: true,
			msg: 'Category updated successfully',
		})
	}

	static delete = async (req, res) => {
		const { id } = req.params

		const category = await CategoryModel.findById(id)
		if (!category) {
			throw new HttpException(StatusCodes.NOT_FOUND, 'Category not found')
		}

		await CategoryModel.findByIdAndDelete(id)

		res.status(StatusCodes.OK).json({
			success: true,
			msg: 'Category deleted successfully',
		})
	}
}

module.exports = { CategoryController }
