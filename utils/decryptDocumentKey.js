import CryptoJs from "crypto-js"

export function decryptDocumentKey(id) {
    return CryptoJs.AES.decrypt(id.replace(new RegExp(process.env.DOCUMENTID_REPLACE_KEY, 'g'), '/'), process.env.CRYPTO_SECRET).toString(CryptoJs.enc.Utf8)
}