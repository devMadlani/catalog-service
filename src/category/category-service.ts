import { Category } from './category-types'
import CategoryModel from './category.model'

export class CategoryService {
    create(category: Category) {
        const newCategory = new CategoryModel(category)
        return newCategory.save()
    }

    async getAll() {
        return await CategoryModel.find()
    }
}
