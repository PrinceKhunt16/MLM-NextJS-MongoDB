export function encode(string) {
    const hashDivider = process.env.HASH_DEVIDER.split(', ').map(Number)
    const stringDivider = process.env.STRING_DEVIDER.split(', ').map(Number)
    const hashParts = []
    const stringparts = []
    const superString = []
    const devider = 15
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.'
    const hashLength = Number(process.env.HASH_LENGTH)
    let hash = ''

    for (let i = 0; i < hashLength; i++) {
        hash += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    for (let i = 0; i < devider - 1; i++) {
        hashParts.push(hash.slice(hashDivider[i], hashDivider[i + 1]))
    }

    for (let i = 0; i < devider; i++) {
        stringparts.push(string.slice(stringDivider[i], stringDivider[i + 1]))
    }

    for (let i = 0, j = 0; i < devider * 2; i++) {
        i % 2 ? superString.push(hashParts[j++]) : superString.push(stringparts[j])
    }

    return superString.join('')
}