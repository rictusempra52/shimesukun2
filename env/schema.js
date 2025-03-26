// @ts-check
const { z } = require('zod')

/**
 * サーバー側で使う環境変数のスキーマを定義
 */
const serverSchema = z.object({
    NEXT_APP_NODE_ENV: z.enum(['development', 'test', 'production']),
    NEXT_APP_SECRET_TOKEN: z.string().regex(/[a-zA-Z0-9]{32}/), // 32文字英数字
    NEXT_APP_DIFY_API_KEY: z.string().min(1),
    NEXT_APP_DIFY_API_ENDPOINT: z.string().url(),
})

/**
 * クライアント側で使う環境変数のスキーマを定義
 * クライアント側に公開するには、`NEXT_PUBLIC_` プレフィックスをつける
 */
const clientSchema = z.object({
    NEXT_PUBLIC_SITE_URL: z.string().url(),
})

/** 
 * クライアント側で使う環境変数を定義
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
const clientEnv = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
}

// エクスポート
module.exports = {
    serverSchema,
    clientSchema,
    clientEnv,
}