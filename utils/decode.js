export function decode(string) {
    const hashDivider = process.env.HASH_DEVIDER.split(', ').map(Number)
    const stringDivider = process.env.STRING_DEVIDER.split(', ').map(Number)
    const superString = []
    const devider = 15

    for (let i = 0, j = 0, k = 0; i <= devider && j <= devider && k < devider * 2; k++, k % 2 ? j++ : i++) {
        if (k % 2) {
            superString.push(string.substring(hashDivider[i] + stringDivider[i], hashDivider[i] + (stringDivider[i + 1] ? stringDivider[i + 1] : string.length)))
        }
    }

    return superString.join('')
}