import type { APIRoute } from 'astro'
import { ProfilesService, updateProfileSchema } from '@/lib/services/profiles.service'
import { z } from 'zod'

const profileService = new ProfilesService()

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await request.json()
    const validatedData = updateProfileSchema.parse(data)

    const profile = await profileService.updateProfile(locals.session.user.id, validatedData)

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: err.errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieznany błąd'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const GET: APIRoute = async ({ locals }) => {
  try {
    if (!locals.session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const profile = await profileService.getProfile(locals.session.user.id)

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieznany błąd'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 