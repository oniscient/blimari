import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { stackServerApp } from './stack'

export async function middleware(request: NextRequest) {
  // Proteger a rota /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const user = await stackServerApp.getUser()
    if (!user) {
      // Redirecionar para a página de login se o utilizador não estiver autenticado
      const signInUrl = new URL('/handler/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

// Configuração para especificar quais rotas o middleware deve abranger
export const config = {
  matcher: '/dashboard/:path*',
}