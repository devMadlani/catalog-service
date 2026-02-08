import { NextFunction, Response } from 'express'
import { Request } from 'express-jwt'
import { v4 as uuidv4 } from 'uuid'
import { validationResult } from 'express-validator'
import createHttpError from 'http-errors'
import { ProductService } from './product-service'
import { Product } from './product-types'
import { FileStorage } from '../common/types/storage'
import { UploadedFile } from 'express-fileupload'
import { AuthRequest, Filter } from '../common/types'
import { Roles } from '../common/constants'
import mongoose from 'mongoose'
import { Logger } from 'winston'

export class ProductController {
    constructor(
        private productService: ProductService,
        private storage: FileStorage,
        private logger: Logger,
    ) {}
    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string))
        }
        const imageName = uuidv4()
        const image = req.files!.image as UploadedFile

        await this.storage.upload({
            fileName: imageName,
            fileData: image.data,
        })

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body

        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration as string),
            attributes: JSON.parse(attributes as string),
            tenantId,
            categoryId,
            isPublish,
            image: imageName,
        }

        const newProduct = await this.productService.createProduct(
            product as unknown as Product,
        )
        this.logger.info('Product created successfully', { id: newProduct._id })

        res.json({ id: newProduct._id })
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string))
        }

        const { productId } = req.params

        const product = await this.productService.getProductById(productId)

        if (!product) {
            return next(createHttpError(404, 'Product not found'))
        }

        if (req.auth?.role != Roles.ADMIN) {
            const tenant = (req as AuthRequest).auth.tenant
            if (product.tenantId != String(tenant)) {
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
            oldImage = product.image

            const image = req.files.image as UploadedFile
            imageName = uuidv4()

            await this.storage.upload({
                fileName: imageName,
                fileData: image.data,
            })

            await this.storage.delete(oldImage as string)
        }

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body

        const productToUpdate = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration as string),
            attributes: JSON.parse(attributes as string),
            tenantId,
            categoryId,
            isPublish,
            image: imageName ? imageName : (oldImage as string),
        }

        await this.productService.updateProduct(productId, productToUpdate)

        this.logger.info('Product updated successfully', { id: productId })

        res.json({ id: productId })
    }

    index = async (req: Request, res: Response, next: NextFunction) => {
        const { q, tenantId, categoryId, isPublish } = req.query

        const filters: Filter = {}

        if (isPublish == 'true') {
            filters.isPublish = true
        }
        if (tenantId) filters.tenantId = tenantId as string

        if (
            categoryId &&
            mongoose.Types.ObjectId.isValid(categoryId as string)
        ) {
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            )
        }
        const prodcuts = await this.productService.getProducts(
            q as string,
            filters,
            {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit
                    ? parseInt(req.query.limit as string)
                    : 10,
            },
        )

        const finalProducts = (prodcuts.data as Product[]).map(
            (product: Product) => ({
                ...product,
                image: this.storage.getObjectUrl(product.image),
            }),
        )

        this.logger.info('Products fetched successfully')

        res.json({
            data: finalProducts,
            total: prodcuts.total,
            pageSize: prodcuts.pageSize,
            currentPage: prodcuts.currentPage,
        })
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        const { productId } = req.params
        const product = await this.productService.getProductById(productId)

        if (!product) {
            return next(createHttpError(404, 'Product not found'))
        }
        this.logger.info('Product fetched successfully', { id: productId })
        res.json(product)
    }

    deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        const { productId } = req.params
        await this.productService.delete(productId)
        this.logger.info('Product deleted successfully', { id: productId })

        res.json({ id: productId })
    }
}
