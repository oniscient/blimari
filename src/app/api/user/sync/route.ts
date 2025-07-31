import { NextResponse } from 'next/server'
import { stackServerApp } from '@/src/stack'
import { db } from '@/src/lib/database/neon'
import { qlooService } from '@/src/services/qloo.service'
import { QlooProfile } from '@/src/types'

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
        passwordHash: null, // Passar null, pois não temos hash de senha
      })
    }

    // Sincronizar perfil Qloo
    let qlooProfile: QlooProfile | undefined = await db.getCulturalProfileByUserId(user.id)

    if (!qlooProfile) {
      try {
        // Criar perfil Qloo se não existir
        const qlooData = {
          userId: user.id,
          email: user.primaryEmail,
          name: user.displayName,
          // Adicionar outros dados do usuário que podem ser relevantes para o Qloo
          // Por exemplo: learningStyle, contentTypes, language, timezone se disponíveis
        }
        const newQlooProfile = await qlooService.createUserTasteProfile(qlooData)
        qlooProfile = await db.createCulturalProfile({
          id: newQlooProfile.id,
          userId: newQlooProfile.userId,
          qlooTasteId: newQlooProfile.qlooTasteId,
          preferences: newQlooProfile.preferences,
          communicationStyle: newQlooProfile.communicationStyle,
          lastSyncAt: newQlooProfile.lastSyncAt,
          createdAt: newQlooProfile.createdAt,
        })
      } catch (qlooError) {
        console.error('Erro ao criar perfil Qloo para o utilizador:', qlooError)
        // Continuar mesmo que a criação do perfil Qloo falhe
      }
    } else {
      // Opcional: Atualizar perfil Qloo existente se houver dados de usuário alterados
      // Por enquanto, vamos apenas garantir que ele existe.
      console.log(`Perfil Qloo para o utilizador ${user.id} já existe.`)
    }

    return NextResponse.json(dbUser)
  } catch (error) {
    console.error('Erro ao sincronizar utilizador:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}