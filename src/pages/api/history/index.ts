import type { APIRoute } from 'astro';
import { HistoryService, historyFiltersSchema, createHistorySchema } from '@/lib/services/history.service';
import { handleError } from '@/lib/utils/api';

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const params = Object.fromEntries(url.searchParams);
    const validatedParams = historyFiltersSchema.parse(params);

    const historyService = new HistoryService();
    //const result = await historyService.getHistory(user.id, validatedParams);

    return new Response(null, { status: 200 }); //JSON.stringify(result)
  } catch (error) {
    return handleError(error);
  }
};

export const POST: APIRoute = async ({ locals, request }) => {
  try {

    const body = await request.json();
    const validatedBody = createHistorySchema.parse(body);

    const historyService = new HistoryService();
    //const result = await historyService.createHistory(user.id, validatedBody);

    return new Response(null, { status: 201 }); //JSON.stringify(result)
  } catch (error) {
    return handleError(error);
  }
}; 