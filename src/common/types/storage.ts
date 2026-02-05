export interface FileData {
    fileName: string
    fileData: Buffer
}

export interface FileStorage {
    upload(data: FileData): Promise<void>
    delete(filename: string): void
    getObjectUrl(filename: string): string
}
