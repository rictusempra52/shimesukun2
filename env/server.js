// @ts-check
const { clientEnv } = require('./client.js')
const { serverSchema } = require("./schema")

// サーバー側で使う環境変数を検証
const _serverEnv = serverSchema.safeParse(process.env);

// 検証に失敗した場合の処理（ブラウザ対応版）
// !は型アサーション演算子で、nullやundefinedを除外する
// ここでは、serverEnv.successがfalseの場合はエラーをコンソールに出力する
if (!_serverEnv.success) {
    console.error(
        '❌ サーバー環境変数が無効です:',
        _serverEnv.error.format()
    );
}

// クライアント側用に定義した値も使用できるようマージしてエクスポート
// module.exportsはCommonJSの書き方で、ES Modulesのexport defaultに相当
// このファイルをimportすると、serverEnvという変数が使えるようになる
// サーバー環境変数とクライアント環境変数をマージして返す
// サーバー環境変数が正常に読み込めなかった場合は、空のオブジェクトを返す

module.exports.serverEnv = _serverEnv.success ? { ..._serverEnv.data, ...clientEnv } : {};