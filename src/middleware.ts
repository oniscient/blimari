
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { stackServerApp } from './stack'
import { db } from '@/src/lib/database/neon' // Import db
import { qlooService } from '@/src/services/qloo.service' // Import qlooService
import { QlooProfile } from '@/src/types' // Import QlooProfile

export async function middleware(request: NextRequest) {
  const user = await stackServerApp.getUser()

  // If user is authenticated, attempt to sync user data to the database
  if (user) {
    try {
      let dbUser = await db.getUserById(user.id);
      let dbUserByEmail = user.primaryEmail ? await db.getUserByEmail(user.primaryEmail) : undefined;

      if (!dbUser) {
        if (dbUserByEmail) {
          // User exists by email but not by ID, update their ID
          await db.updateUser(dbUserByEmail.id, {
            id: user.id, // Update with new Stack Auth ID
            name: user.displayName || dbUserByEmail.name, // Keep existing name if new is null
            // avatarUrl: user.avatarUrl || dbUserByEmail.avatarUrl, // Removed as user.avatarUrl is not available from CurrentServerUser
            updatedAt: new Date().toISOString(), // Convert Date to ISO string
          });
          console.log('Middleware User Sync: Updated existing user ID and data for email:', user.primaryEmail);
          // Simulate updated user for subsequent logic in middleware
          dbUser = { ...dbUserByEmail, id: user.id, name: user.displayName || dbUserByEmail.name, updatedAt: new Date().toISOString() }; // Removed avatarUrl
        } else {
          // User does not exist by ID or email, create new
          dbUser = await db.createUser({
            id: user.id,
            email: user.primaryEmail || undefined,
            name: user.displayName || undefined,
            passwordHash: null,
          });
          console.log('Middleware User Sync: Created new user in DB:', dbUser.id);
        }

        // Sync Qloo profile if user is new or updated
        let qlooProfile: QlooProfile | undefined = await db.getCulturalProfileByUserId(user.id);
        if (!qlooProfile) {
          try {
            const qlooData = {
              userId: user.id,
              email: user.primaryEmail,
              name: user.displayName,
            };
            const newQlooProfile = await qlooService.createUserTasteProfile(qlooData);
            await db.createCulturalProfile({
              id: newQlooProfile.id,
              userId: newQlooProfile.userId,
              qlooTasteId: newQlooProfile.qlooTasteId,
              preferences: newQlooProfile.preferences,
              communicationStyle: newQlooProfile.communicationStyle,
              lastSyncAt: newQlooProfile.lastSyncAt,
              createdAt: newQlooProfile.createdAt,
            });
            console.log('Middleware User Sync: Created new Qloo profile for user:', user.id);
          } catch (qlooError) {
            console.error('Middleware User Sync: Erro ao criar perfil Qloo para o utilizador:', qlooError);
          }
        }
      }
    } catch (error) {
      console.error('Middleware User Sync: Erro ao sincronizar utilizador no middleware:', error);
    }
  }

  // Protect /dashboard and /create/processing routes
  if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/create/processing')) {
    if (!user) {
      // Redirecionar para a página de login se o utilizador não estiver autenticado
      const signInUrl = new URL('/handler/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

// Configuração para especificar quais rotas o middleware deve abranger
export const config = {
  matcher: ['/dashboard/:path*', '/create/processing/:path*'],
}