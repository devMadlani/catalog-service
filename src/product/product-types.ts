interface Attribute {
    name?: string
    value?: string | number
}

export type PriceConfiguration = Map<
    string,
    {
        priceType?: 'base' | 'additional'
        availableOptions?: Map<string, number>
    }
>

export interface Product {
    name: string
    description: string
    priceConfiguration: PriceConfiguration
    attributes: Attribute[]
    tenantId: string
    categoryId: string
    image: string
}
