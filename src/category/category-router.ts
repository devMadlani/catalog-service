import express from 'express'
import { CategoryController } from './category-controller'
import categoryValidator from './category-validator'
import { CategoryService } from './category-service'
import logger from '../config/logger'
import { asyncWrapper } from '../common/utils/wrapper'
import authenticate from '../common/middleware/authenticate'
import { canAccess } from '../common/middleware/canAccess'
import { Roles } from '../common/constants'

const router = express.Router()

const categoryService = new CategoryService()
const categoryController = new CategoryController(categoryService, logger)

router.post(
    '/',
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryValidator,
    asyncWrapper(categoryController.create),
)

export default router
