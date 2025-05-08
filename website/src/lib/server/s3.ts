import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { PRIVATE_B2_KEY_ID, PRIVATE_B2_APP_KEY, PRIVATE_B2_BUCKET, PRIVATE_B2_REGION, PRIVATE_B2_ENDPOINT } from '$env/static/private';

const s3Client = new S3Client({
    endpoint: PRIVATE_B2_ENDPOINT,
    region: PRIVATE_B2_REGION,
    credentials: {
        accessKeyId: PRIVATE_B2_KEY_ID,
        secretAccessKey: PRIVATE_B2_APP_KEY
    }
});

export async function generatePresignedUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: PRIVATE_B2_BUCKET,
        Key: key,
        ContentType: contentType
    });

    return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}

export async function deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: PRIVATE_B2_BUCKET,
        Key: key
    });

    await s3Client.send(command);
}

export async function generateDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: PRIVATE_B2_BUCKET,
        Key: key
    });

    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export { s3Client };