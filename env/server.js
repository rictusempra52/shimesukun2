// @ts-check
const { clientEnv } = require('./client.js')
const { serverSchema } = require("./schema")

// サーバー側で使う環境変数を検証
const _serverEnv = serverSchema.safeParse(process.env);

if (!_serverEnv.success) {
    console.error(
        '❌ サーバー環境変数が無効です:',
        _serverEnv.error.format()
    );

    throw new Error('サーバー環境変数の検証に失敗しました。');
}

module.exports.serverEnv = { ..._serverEnv.data, ...clientEnv };