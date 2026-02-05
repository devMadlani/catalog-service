export interface FileData {
    fileName: string
    fileData: Buffer
}

export interface FileStorage {
    upload(data: FileData): Promise<void>
    delete(filename: string): Promise<void>
    getObjectUrl(filename: string): string
}
