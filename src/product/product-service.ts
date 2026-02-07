import { Filter } from '../common/types'
import productModel from './product-model'
import { Product } from './product-types'

export class ProductService {
    async createProduct(product: Product) {
        return await productModel.create(product)
    }
    async getProductById(productId: string) {
        const product = await productModel.findById(productId)
        return product
    }

    async updateProduct(productId: string, product: Product) {
        return await productModel.findOneAndUpdate(
            { _id: productId },
            {
                $set: product,
            },
            {
                new: true,
            },
        )
    }
    async getProducts(q: string, filters: Filter) {
        const serachQueryRegexp = new RegExp(q, 'i')

        const matchQuery = { ...filters, name: serachQueryRegexp }
        const aggregate = productModel.aggregate([
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category',
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                attributes: 1,
                                priceConfiguration: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: '$category',
            },
        ])

        const result = await aggregate.exec()

        return result as Product[]
    }
}
