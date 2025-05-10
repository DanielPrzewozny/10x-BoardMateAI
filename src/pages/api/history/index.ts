import type { APIRoute } from "astro";
import {
  RecommendationService,
  recommendationFiltersSchema,
  createRecommendationSchema,
} from "@/lib/services/recommendation.service";
import { handleError } from "@/lib/utils/api";

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const params = Object.fromEntries(url.searchParams);
    const validatedParams = recommendationFiltersSchema.parse(params);

    const recommendationService = new RecommendationService();
    //const result = await recommendationService.getRecommendations(user.id, validatedParams);

    return new Response(null, { status: 200 }); //JSON.stringify(result)
  } catch (error) {
    return handleError(error);
  }
};

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const body = await request.json();
    const validatedBody = createRecommendationSchema.parse(body);

    const recommendationService = new RecommendationService();
    //const result = await recommendationService.createRecommendation(user.id, validatedBody);

    return new Response(null, { status: 201 }); //JSON.stringify(result)
  } catch (error) {
    return handleError(error);
  }
};
