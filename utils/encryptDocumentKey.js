import CryptoJs from "crypto-js"

export function encryptDocumentKey(id) {
    return CryptoJs.AES.encrypt(id, process.env.CRYPTO_SECRET).toString().replace(/\//g, process.env.DOCUMENTID_REPLACE_KEY)
}