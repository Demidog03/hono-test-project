import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.ts"

export const relations = defineRelations(schema, r => ({
    UserTable: {
        booksAdded: r.many.BookTable() // one-to-many - Один юзер может добавлять много книг
    },
    AuthorTable: {
        books: r.many.BookTable(), // one-to-many - Один автор может быть автором множества книг
    },
    BookTable: {
        author: r.one.AuthorTable({ // one-to-one - Книга может иметь лишь одного автора
            from: r.BookTable.authorId,
            to: r.AuthorTable.id
        }),
        addedByUser: r.one.UserTable({ // one-to-one - Книга может быть добавлена в базу лишь один юзером
            from: r.BookTable.addedBy,
            to: r.UserTable.id
        })
    }
}))    