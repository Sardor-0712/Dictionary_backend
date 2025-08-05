const { JWT_SECRET } = require('../utils/secret.js')
const { HttpException } = require('../utils/http_exception.js')
const { StatusCodes } = require('http-status-codes')
const { verify } = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
	const token = req.headers.authorization?.split(' ')[1]

	if (!token) {
		throw new HttpException(StatusCodes.UNAUTHORIZED, 'No token provided')
	}

	try {
		const decoded = verify(token, JWT_SECRET)
		req.user = decoded

		next()
	} catch (error) {
		throw new HttpException(StatusCodes.UNAUTHORIZED, 'Invalid token')
	}
}

module.exports = { authMiddleware }
