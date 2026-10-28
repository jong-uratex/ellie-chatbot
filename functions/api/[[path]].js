/**
 * Cloudflare Pages Function: /api/[[path]]
 * Intercepts all requests matching /api/* on https://ellie-chatbot.pages.dev/api/*
 */
import { handleCloudflareRequest, optionsResponse } from '../_shared/data.js';

export async function onRequest(context) {
  return handleCloudflareRequest(context);
}

export async function onRequestOptions(context) {
  return optionsResponse();
}
