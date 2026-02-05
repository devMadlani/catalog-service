import mongoose from 'mongoose'
import { Attribute, Category, PriceConfiguration } from './category-types'

const priceConfigurationSchema = new mongoose.Schema<PriceConfiguration>({
    priceType: {
        type: String,
        enum: ['base', 'additional'],
        required: true,
    },
    availableOptions: {
        type: [String],
        required: true,
    },
})

const attributeScema = new mongoose.Schema<Attribute>({
    name: {
        type: String,
        required: true,
    },
    widgetType: {
        type: String,
        required: true,
        enum: ['switch', 'radio'],
    },
    defaultValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    availableOptions: {
        type: [String],
        required: true,
    },
})

const categorySchema = new mongoose.Schema<Category>({
    name: {
        type: String,
        required: true,
    },
    priceConfiguration: {
        type: Map,
        of: priceConfigurationSchema,
        required: true,
    },
    attributes: {
        type: [attributeScema],
        required: true,
    },
})

export default mongoose.model('Category', categorySchema)
