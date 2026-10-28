/**
 * Cloudflare Pages Function: /api.php
 * Intercepts requests to https://ellie-chatbot.pages.dev/api.php
 * Provides 100% backward compatibility for legacy embed snippets pointing to api.php.
 */
import { handleCloudflareRequest, optionsResponse } from './_shared/data.js';

export async function onRequest(context) {
  return handleCloudflareRequest(context);
}

export async function onRequestOptions(context) {
  return optionsResponse();
}
