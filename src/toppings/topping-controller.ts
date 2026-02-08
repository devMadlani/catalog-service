import { NextFunction, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { Request } from 'express-jwt'
import { Topping } from './topping-types'
import { UploadedFile } from 'express-fileupload'
import { FileStorage } from '../common/types/storage'
import { ToppingService } from './topping-service'
import { Logger } from 'winston'
import createHttpError from 'http-errors'
import { validationResult } from 'express-validator'
import { Roles } from '../common/constants'
import { AuthRequest } from '../common/types'

export class ToppingController {
    constructor(
        private storage: FileStorage,
        private toppingService: ToppingService,
        private logger: Logger,
    ) {}
    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string))
        }

        const image = req.files!.image as UploadedFile
        const fileUuid = uuidv4()

        await this.storage.upload({
            fileName: fileUuid,
            fileData: image.data,
        })

        const saveTopping = await this.toppingService.create({
            ...req.body,
            image: fileUuid,
            tenantId: req.body.tenantId,
        } as Topping)

        this.logger.info('Topping Created succesfully', { id: saveTopping._id })

        res.json({ id: saveTopping._id })
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string))
        }

        const toppingId = req.params.toppingId

        const topping = await this.toppingService.getById(toppingId)

        if (!topping) {
            return next(createHttpError(404, 'Topping not found'))
        }

        if (req.auth?.role != Roles.ADMIN) {
            const tenant = (req as AuthRequest).auth.tenant
            if (topping.tenantId != String(tenant)) {
                return next(
                    createHttpError(
                        403,
                        'You are not allowed to access this product',
                    ),
                )
            }
        }

        let imageName: string | undefined
        let oldImage: string | undefined

        if (req.files?.image) {
            oldImage = topping.image

            const image = req.files.image as UploadedFile
            imageName = uuidv4()

            await this.storage.upload({
                fileName: imageName,
                fileData: image.data,
            })

            await this.storage.delete(oldImage as string)
        }
        const { name, price, tenantId } = req.body
        const toppingToUpdate = {
            name,
            price,
            tenantId,
            image: imageName ? imageName : (oldImage as string),
        }
        await this.toppingService.updateTopping(toppingId, toppingToUpdate)

        this.logger.info('Topping updated successfully', { id: toppingId })

        res.json({ id: toppingId })
    }
    get = async (req: Request, res: Response) => {
        const toppings = await this.toppingService.getAll(
            req.query.tenantId as string,
            {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit
                    ? parseInt(req.query.limit as string)
                    : 10,
            },
        )

        // todo: add error handling
        const readyToppings = (toppings.data as Topping[]).map((topping) => {
            return {
                id: topping._id,
                name: topping.name,
                price: topping.price,
                tenantId: topping.tenantId,
                image: this.storage.getObjectUri(topping.image),
            }
        })

        this.logger.info('Toppings fetched successfully')
        res.json({
            data: readyToppings,
            total: toppings.total,
            pageSize: toppings.pageSize,
            currentPage: toppings.currentPage,
        })
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId } = req.params
        const topping = await this.toppingService.getById(toppingId)
        if (!topping) {
            return next(createHttpError(404, 'Product not found'))
        }

        const finalTopping = {
            ...topping,
            image: this.storage.getObjectUri(topping.image),
        }
        this.logger.info('Topping fetch successfully', { id: topping._id })

        res.json(finalTopping)
    }

    deleteTopping = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId } = req.params

        const deletedTopping = await this.toppingService.delete(toppingId)

        if (deletedTopping) {
            await this.storage.delete(deletedTopping?.image)
        }

        this.logger.info('Topping deleted successfully', { id: toppingId })

        res.json({ id: toppingId })
    }
}
