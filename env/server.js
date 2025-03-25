// @ts-check
require('dotenv').config()
const { clientEnv } = require('./client.js')
const { serverSchema } = require("./schema")

// サーバー側で使う環境変数を検証
const _serverEnv = serverSchema.safeParse(process.env);

console.log('🚀 サーバー環境変数:', _serverEnv.data);

// 検証に失敗した場合の処理（ブラウザ対応版）
if (!_serverEnv.success) {
    console.error(
        '❌ サーバー環境変数が無効です:',
        JSON.stringify(_serverEnv.error.format(), null, 4)
    );


    // ブラウザ環境では終了せず、サーバーサイドのみ終了する
    if (typeof window === 'undefined') {
        process.exit(1);
    }
}

// クライアント側用に定義した値も使用できるようマージしてエクスポート
module.exports.serverEnv = _serverEnv.success
    // 成功した場合はサーバー環境変数とクライアント環境変数をマージして返す
    ? { ..._serverEnv.data, ...clientEnv }
    // 失敗した場合もクライアント環境変数だけは返す
    : { ...clientEnv };