import { Filter, PaginateQuery } from '../common/types'
import { paginationLabels } from '../config/pagination'
import productModel from './product-model'
import { Product } from './product-types'

export class ProductService {
    async createProduct(product: Product) {
        return await productModel.create(product)
    }
    async getProductById(productId: string) {
        return await productModel.findById(productId).lean()
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
    async getProducts(
        q: string,
        filters: Filter,
        paginateQuery: PaginateQuery,
    ) {
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

        return productModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        })

        // const result = await aggregate.exec()

        // return result as Product[]
    }

    async delete(productId: string) {
        return await productModel.findByIdAndDelete(productId)
    }
}
