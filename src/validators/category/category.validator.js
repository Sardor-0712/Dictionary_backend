const { check, body, param, query } = require('express-validator')

class CategoryValidator {
	static add = () => [
		body('name')
			.notEmpty()
			.withMessage("Name maydonini to'ldiring")
			.isString()
			.withMessage("Name maydoni matn bo'lishi kerak"),
		body('related_dic')
			.notEmpty()
			.withMessage("Dictionary maydonini to'ldiring"),
		body('related_sec').notEmpty().withMessage("Section maydonini to'ldiring"),
	]

	static update = () => [
		param('id', 'ID MongoDB OjectID ga mos kelishi kerak').isMongoId(),
		body('name', "Name maydoni matn bo'lishi kerak").optional().isString(),
		body('related_dic')
			.optional()
			.isString()
			.withMessage("Dictionary maydoni matn bo'lishi kerak"),
		body('related_sec')
			.optional()
			.notEmpty()
			.withMessage("Section maydonini to'ldiring"),
	]
}

module.exports = { CategoryValidator }
