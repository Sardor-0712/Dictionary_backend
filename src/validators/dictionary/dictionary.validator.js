const { check, body, param, query } = require('express-validator')

class DictionaryValidator {
	static add = () => [
		body('name')
			.notEmpty()
			.withMessage("Name maydonini to'ldiring .")
			.bail()
			.isString()
			.withMessage("Name maydoni matn bo'lishi kerak"),
		body('desc')
			.optional()
			.isString()
			.withMessage("Description maydoni matn bo'lishi kerak"),
		body('image').optional().isURL().withMessage("Image URL bo'lishi lozim"),
	]

	static update = () => [
		param('id', 'ID MongoDB OjectID ga mos kelishi kerak').isMongoId(),
		body('type')
			.optional()
			.isString()
			.withMessage("Type maydoni matn bo'lishi kerak"),
		body('name', "Name maydoni matn bo'lishi kerak").optional().isString(),
		body('desc')
			.optional()
			.isString()
			.withMessage("Desc maydoni matn bo'lishi kerak"),
		body('image').optional().isURL().withMessage("Image URL bo'lishi lozim"),
	]
}

module.exports = { DictionaryValidator }
