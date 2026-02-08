import { PaginateQuery } from '../common/types'
import { paginationLabels } from '../config/pagination'
import toppingModel from './topping-model'
import { Topping } from './topping-types'

export class ToppingService {
    async create(topping: Topping) {
        return await toppingModel.create(topping)
    }

    async updateTopping(toppingId: string, topping: Topping) {
        return await toppingModel.findByIdAndUpdate(
            toppingId,
            { $set: topping },
            { new: true },
        )
    }

    async getAll(tenantId: string, paginateQuery: PaginateQuery) {
        const aggregate = toppingModel.aggregate([
            {
                $match: { tenantId },
            },
        ])
        return toppingModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        })
    }

    async getById(toppingId: string) {
        return toppingModel.findById(toppingId).lean()
    }

    async delete(toppingId: string) {
        return toppingModel.findByIdAndDelete(toppingId)
    }
}
