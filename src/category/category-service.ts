import { Category } from './category-types'
import categoryModel from './category.model'
import CategoryModel from './category.model'

export class CategoryService {
    create(category: Category) {
        const newCategory = new CategoryModel(category)
        return newCategory.save()
    }
    async update(categoryId: string, cateogry: Category) {
        return await categoryModel.findByIdAndUpdate(
            categoryId,
            { $set: cateogry },
            { new: true },
        )
    }

    async getAll() {
        return await CategoryModel.find()
    }

    async getById(categoryId: string) {
        return await CategoryModel.findById(categoryId)
    }

    async delete(categoryId: string) {
        return await CategoryModel.findByIdAndDelete(categoryId)
    }
}
