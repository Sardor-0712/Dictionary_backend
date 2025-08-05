const { Router } = require('express')

const { DictionaryController } = require('../../controllers/dictionary/dictionary.controller.js')
const { expressValidate } = require('../../validators/index.js')
const { DictionaryValidator } = require('../../validators/dictionary/dictionary.validator.js')
const { uploadFile } = require('../../utils/file-upload.js')
const dictionaryRouter = Router()

dictionaryRouter.get('/get-all', expressValidate, DictionaryController.getAll)

dictionaryRouter.get(
	'/get-by-id/:id',
	expressValidate,
	DictionaryController.getById
)

// For form-data: name, desc (fields), image (file)
dictionaryRouter.post(
	'/add',
	uploadFile.single('image'),
	DictionaryValidator.add(),
	expressValidate,
	DictionaryController.add
)
dictionaryRouter.put(
	'/update/:id',
	DictionaryValidator.update(),
	expressValidate,
	DictionaryController.update
)
dictionaryRouter.delete(
	'/delete/:id',
	expressValidate,
	DictionaryController.delete
)

module.exports = { dictionaryRouter }
