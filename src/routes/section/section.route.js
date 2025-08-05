const { Router } = require('express')
const {
	SectionController,
} = require('../../controllers/section/section.controller.js')
const { expressValidate } = require('../../validators/index.js')
const {
	SectionValidator,
} = require('../../validators/section/section.validator.js')
const sectionRouter = Router()
const multer = require('multer');
const upload = multer();

sectionRouter.get('/get-all', expressValidate, SectionController.getAll)

sectionRouter.get('/get-by-id/:id', expressValidate, SectionController.getById)

sectionRouter.get(
	'/by-dictionary/:id',
	expressValidate,
	SectionController.getByDictionary
)
sectionRouter.post(
	'/add',
	upload.single('image'),
	SectionValidator.add(),
	expressValidate,
	SectionController.add
)
sectionRouter.put(
	'/update/:id',
	SectionValidator.update(),
	expressValidate,
	SectionController.update
)
sectionRouter.delete('/delete/:id', expressValidate, SectionController.delete)

module.exports = sectionRouter
