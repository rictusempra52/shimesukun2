// @ts-check
const { clientEnv, clientSchema } = require('./schema')

// クライアント側で使う環境変数を検証
const _clientEnv = clientSchema.safeParse(clientEnv)

// 検証に失敗した場合はビルドエラーにする
if (!_clientEnv.success) {
    console.error(
        '❌ Invalid public environment variables:',
        JSON.stringify(_clientEnv.error.format(), null, 4)
    )
    process.exit(1)
}

// `NEXT_PUBLIC_` で始まらない環境変数名がある場合はビルドエラーにする
for (let key of Object.keys(_clientEnv.data)) {
    if (!key.startsWith('NEXT_PUBLIC_')) {
        console.error(
            `❌ Invalid public environment variable name: ${key}. It must begin with 'NEXT_PUBLIC_'`
        )
        process.exit(1)
    }
}

// 検証済みの値をエクスポート
module.exports.clientEnv = _clientEnv.data