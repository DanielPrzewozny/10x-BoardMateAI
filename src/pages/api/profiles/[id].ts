import type { APIRoute } from 'astro';
import { ProfilesService, updateProfileSchema } from '@/lib/services/profiles.service';
import { handleError } from '@/lib/utils/api';

export const prerender = false;

export const GET: APIRoute = async ({ locals, params }) => {
  try {

    //const { id } = params;
    //if (!id) {
    //  return new Response(JSON.stringify({ error: 'ID użytkownika jest wymagane' }), { status: 400 });
    //}

    // Sprawdzenie uprawnień - tylko własny profil lub admin
    //if (user.id !== id && user.role !== 'admin') {
    //  return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    //}

    const profilesService = new ProfilesService();
    //const result = await profilesService.getProfile(id);

    return new Response(null, { status: 200 }); //JSON.stringify(result)
  } catch (error) {
    return handleError(error);
  }
};

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  try {

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID użytkownika jest wymagane' }), { status: 400 });
    }

    // Sprawdzenie uprawnień - tylko własny profil lub admin
    //if (user.id !== id && user.role !== 'admin') {
    //  return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    //}

    const body = await request.json();
    const validatedBody = updateProfileSchema.parse(body);

    const profilesService = new ProfilesService();
    const result = await profilesService.updateProfile(id, validatedBody);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}; 