import { sValidator } from "@hono/standard-validator"
import { Hono } from 'hono'
import z from 'zod'
import { db } from "../db/db.ts"
import { hashPassword, verifyPassword } from "../lib/crypto.ts"
import { UserTable } from "../db/schema.ts"
import { jwt, sign } from "hono/jwt"
import { env } from "../data/env.ts"

const app = new Hono()

const JWT_EXPIRATION_SECONDS = 5 * 60 * 60

const registerValidation = z.object({
    name: z.string().min(1).max(255),
    email: z.email().min(1),
    password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*_(),.?":{}|<>]/, 'Password must contain at least one special character')
})

const loginValidation = z.object({
    email: z.email().min(1),
    password: z.string().min(1)
})

app.post('/register', sValidator('json', registerValidation), async (context) => {
    const { name, email, password } = context.req.valid('json')
    const existing = await db.query.UserTable.findFirst({ where: { email } })
    if (existing) {
        return context.json({ error: 'Email already in use' }, 409) // 409 Conflict
    }

    const passwordHash = await hashPassword(password)
    const [user] = await db
        .insert(UserTable)
        .values({ name, email, password: passwordHash })
        .returning({ id: UserTable.id, name: UserTable.name, email: UserTable.email })

    return context.json(user, 201) // 201 - Created
})

app.post("/login", sValidator('json', loginValidation), async (context) => {
    const { email, password } = context.req.valid('json')
    const user = await db.query.UserTable.findFirst({ where: { email } })

    if (!user) {
        return context.json({ error: 'Invalid email or password' }, 401) // 401 Unauthorized
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
        return context.json({ error: 'Invalid email or password' }, 401)
    }

    const now = Math.floor(Date.now() / 1000)

    const token = await sign(
        { exp: now + JWT_EXPIRATION_SECONDS, id: user.id, email: user.email },
        env.JWT_SECRET,
        'HS256'
    )

    return context.json({ token })
})

app.get('/me', jwt({ secret: env.JWT_SECRET, alg: 'HS256' }), async (context) => {
    const payload = context.get('jwtPayload')

    const user = await db.query.UserTable.findFirst({ where: { id: payload?.id } })

    if (!user) {
        return context.json({ error: 'User not found' }, 404)
    }

    const { password, ...safeUser } = user

    return context.json({ user: safeUser }, 200)
})

export default app