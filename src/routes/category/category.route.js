const { Router } = require('express')
const { CategoryController } = require('../../controllers/category/category.controller.js')
const { expressValidate } = require('../../validators/index.js')
const { CategoryValidator } = require('../../validators/category/category.validator.js')
const categoryRouter = Router()

const multer = require('multer');
const upload = multer();

categoryRouter.get('/get-all', expressValidate, CategoryController.getAll)

categoryRouter.get(
	'/get-by-id/:id',
	expressValidate,
	CategoryController.getById
)

categoryRouter.get('/by-section/:id', CategoryController.getBySection);


categoryRouter.post(
	'/add',
	upload.single('image'),
	CategoryValidator.add(),
	expressValidate,
	CategoryController.add
)

categoryRouter.put(
	'/update/:id',
	CategoryValidator.update(),
	expressValidate,
	CategoryController.update
)

categoryRouter.delete('/delete/:id', expressValidate, CategoryController.delete)

module.exports = { categoryRouter }
