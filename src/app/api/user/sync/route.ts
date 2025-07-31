import { NextResponse } from 'next/server'
import { stackServerApp } from '@/src/stack'
import { db } from '@/src/lib/database/neon'

export async function POST() {
  try {
    const user = await stackServerApp.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o utilizador já existe na nossa base de dados
    let dbUser = await db.getUserById(user.id)

    // Se não existir, criar um novo utilizador
    if (!dbUser) {
      dbUser = await db.createUser({
        id: user.id,
        email: user.primaryEmail || undefined,
        name: user.displayName || undefined,
        // O campo passwordHash não é necessário aqui, pois a autenticação é gerida pelo Stack Auth
        // A função createUser em neon.ts pode precisar de ser ajustada para não exigir passwordHash
        passwordHash: null, // Passar null, pois não temos hash de senha
      })
    }

    return NextResponse.json(dbUser)
  } catch (error) {
    console.error('Erro ao sincronizar utilizador:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}