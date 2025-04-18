import type { APIRoute } from 'astro';
import { PreferencesService, preferencesSchema } from '@/lib/services/preferences.service';
import { handleError } from '@/lib/utils/api';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const preferencesService = new PreferencesService();
    //const result = await preferencesService.getPreferences(user.id);

    return new Response(null, { status: 200 }); //JSON.stringify(result)
  } catch (error) {
    return handleError(error);
  }
};

export const PUT: APIRoute = async ({ locals, request }) => {
  try {
    const body = await request.json();
    const validatedBody = preferencesSchema.parse(body);

    const preferencesService = new PreferencesService();
    //const result = await preferencesService.updatePreferences(user.id, validatedBody);

    return new Response(null, { status: 200 }); //JSON.stringify(result)
  } catch (error) {
    return handleError(error);
  }
}; 