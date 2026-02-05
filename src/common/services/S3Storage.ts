import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import config from 'config'
import { FileData, FileStorage } from '../types/storage'

export class S3Storage implements FileStorage {
    private client: S3Client
    constructor() {
        this.client = new S3Client({
            region: config.get('s3.region'),
            credentials: {
                accessKeyId: config.get('s3.accessKeyId'),
                secretAccessKey: config.get('s3.secretAccessKey'),
            },
        })
    }
    async upload(data: FileData): Promise<void> {
        const objeParams = {
            Bucket: config.get('s3.bucket'),
            Key: data.fileName,
            Body: data.fileData,
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        this.client.send(new PutObjectCommand(objeParams))
    }
    delete(filename: string): void {
        throw new Error('Method not implemented.')
    }
    getObjectUrl(filename: string): string {
        throw new Error('Method not implemented.')
    }
}
