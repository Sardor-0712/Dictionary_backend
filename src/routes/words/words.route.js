const { Router } = require('express')
const {
	WordsController,
} = require('../../controllers/words/words.controller.js')
const { expressValidate } = require('../../validators/index.js')
const { WordsValidator } = require('../../validators/words/words.validator.js')
const wordsRouter = Router()
const multer = require('multer');
const upload = multer();

wordsRouter.get('/get-all', expressValidate, WordsController.getAll)

wordsRouter.get('/get-by-id/:id', expressValidate, WordsController.getById)

wordsRouter.post(
	'/add',
	upload.single('image'),
	WordsValidator.add(),
	expressValidate,
	WordsController.add
)

wordsRouter.get('/get-by-id/:id', expressValidate, WordsController.getById)

wordsRouter.put(
	'/update/:id',
	WordsValidator.update(),
	expressValidate,
	WordsController.update
)

wordsRouter.delete('/delete/:id', expressValidate, WordsController.delete)

module.exports = wordsRouter
