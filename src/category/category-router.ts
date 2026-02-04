import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express'
import { CategoryController } from './category-controller'
import categoryValidator from './category-validator'
import { CategoryService } from './category-service'
import logger from '../config/logger'
import createHttpError from 'http-errors'
import { asyncWrapper } from '../common/utils/wrapper'
import authenticate from '../common/middleware/authenticate'

const router = express.Router()

const categoryService = new CategoryService()
const categoryController = new CategoryController(categoryService, logger)

router.post(
    '/',
    authenticate,
    categoryValidator,
    asyncWrapper(categoryController.create),
)

export default router
