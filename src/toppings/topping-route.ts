import express from 'express'
import { asyncWrapper } from '../common/utils/wrapper'
import createToppingValidator from './create-topping-validator'
import createHttpError from 'http-errors'
import fileUpload from 'express-fileupload'
import { canAccess } from '../common/middlewares/canAccess'
import authenticate from '../common/middlewares/authenticate'
import { Roles } from '../common/constants'
import { ToppingController } from './topping-controller'
import { S3Storage } from '../common/services/S3Storage'
import { ToppingService } from './topping-service'
import logger from '../config/logger'
import updateToppingValidator from './update-topping-validator'

const router = express.Router()

const toppingSerive = new ToppingService()
const toppingController = new ToppingController(
    new S3Storage(),
    toppingSerive,
    logger,
)

router.post(
    '/',
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 }, // 500kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, 'File size exceeds the limit')
            next(error)
        },
    }),
    createToppingValidator,
    asyncWrapper(toppingController.create),
)

router.put(
    '/:toppingId',
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 }, // 500kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, 'File size exceeds the limit')
            next(error)
        },
    }),
    updateToppingValidator,
    asyncWrapper(toppingController.update),
)

router.get('/', asyncWrapper(toppingController.get))

router.get('/:toppingId', asyncWrapper(toppingController.getById))
router.delete('/:toppingId', asyncWrapper(toppingController.deleteTopping))
export default router
