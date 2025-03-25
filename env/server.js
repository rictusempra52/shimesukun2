// @ts-check
const { clientEnv } = require('./client.js')
const { serverSchema } = require("./schema")

// サーバー側で使う環境変数を検証
const _serverEnv = serverSchema.safeParse(process.env);

// 検証に失敗した場合はビルドエラーにする
if (!_serverEnv.success) {
    console.error(
        '❌ サーバー環境変数が無効です:',
        JSON.stringify(_serverEnv.error.format(), null, 4)
    );
    process.exit(1);
}

// クライアント側用に定義した値も使用できるようマージしてエクスポート
module.exports.serverEnv = { ..._serverEnv.data, ...clientEnv }