import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

export async function hashPassword(password: string) { // Qwerty123! -> fdfdksbfkdb4bi34h952y9sfhis
    const salt = randomBytes(16).toString('hex')
    const hash = await scryptAsync(password, salt)

    return `${salt}:${hash.toString('hex')}`
}

export async function verifyPassword(password: string, passwordHash: string) { // (Qwerty123!, fgikodngodfngofdnogfdgdf)
    const [salt, hashHex] = passwordHash.split(":")
    const stored = Buffer.from(hashHex, 'hex')
    const devired = await scryptAsync(password, salt)

    return timingSafeEqual(stored, devired) // безопасность
}

async function scryptAsync(password: string, salt: string) {
    return new Promise<Buffer<ArrayBuffer>>((res, rej) => {
        scrypt(password, salt, 64, (err, deviredKey) => {
            if (err) {
                return rej(err)
            }

            return res(deviredKey)
        })
    })
}