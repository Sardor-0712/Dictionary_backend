const { check, body, param, query } = require('express-validator')

class SectionValidator {
	static add = () => [
		body('name')
			.notEmpty()
			.withMessage("Name maydonini to'ldiring")
			.bail()
			.isString()
			.withMessage("Name maydoni matn bo'lishi kerak"),
		body('related_dic')
			.notEmpty()
			.withMessage("Dictionary maydonini to'ldiring")
			.bail()
			.isString()
			.withMessage("Dictionary maydoni matn bo'lishi kerak"),
		body('image').optional().isURL().withMessage("Image URL bo'lishi lozim"),
	]

	static update = () => [
		param('id', 'ID MongoDB OjectID ga mos kelishi kerak').isMongoId(),
		body('name', "Name maydoni matn bo'lishi kerak").optional().isString(),
		body('related_dic')
			.optional()
			.isString()
			.withMessage("Dictionary maydoni matn bo'lishi kerak"),
		body('image').optional().isURL().withMessage("Image URL bo'lishi lozim"),
	]
}

module.exports = { SectionValidator }
