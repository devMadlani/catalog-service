export interface PriceConfiguration {
    [key: string]: {
        priceType: 'base' | 'additional'
        availableOptions: string[]
    }
}

export interface Attribute {
    name: string
    widgetType: 'swtich' | 'radio'
    defaultValue: string
    availableOptions: string[]
}

export interface Category {
    name: string
    priceConfiguration: PriceConfiguration
    attributes: Attribute[]
}
