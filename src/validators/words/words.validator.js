const { check, body, param, query } = require('express-validator')

class WordsValidator {
	static add = () => [
		body('name')
			.notEmpty()
			.withMessage("Name maydonini to'ldiring")
			.isString()
			.withMessage("Name maydoni matn bo'lishi kerak"),
		body('desc')
			.optional()
			.isString()
			.withMessage("Description maydoni matn bo'lishi kerak"),
		body('related_cat').notEmpty().withMessage("Category maydonini to'ldiring"),
		body('related_dic')
			.notEmpty()
			.withMessage("Dictionary maydonini to'ldiring"),
		body('related_sec').notEmpty().withMessage("Section maydonini to'ldiring"),
		body('image')
			.optional()
			.isURL()
			.withMessage("Image maydoni URL bo'lishi kerak"),
	]

	static update = () => [
		param('id', 'ID MongoDB OjectID ga mos kelishi kerak').isMongoId(),
		body('name', "Name maydoni matn bo'lishi kerak").optional().isString(),
		body('desc', "Description maydoni matn bo'lishi kerak")
			.optional()
			.isString(),
		body('related_dic')
			.optional()
			.isMongoId()
			.withMessage("Lo'g'at maydoni MongoDB OjectID bo'lishi kerak"),
		body('related_sec')
			.optional()
			.isMongoId()
			.withMessage("Bo'lim maydoni MongoDB OjectID bo'lishi kerak"),
		body('related_cat')
			.optional()
			.isMongoId()
			.withMessage("Kategoriya maydoni MongoDB OjectID bo'lishi kerak"),
		body('image')
			.optional()
			.isURL()
			.withMessage("Image maydoni URL bo'lishi kerak"),
	]
}

module.exports = { WordsValidator }
