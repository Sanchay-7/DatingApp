/**
 * Frontend diagnostics helper
 * Use to debug authentication and API calls
 */

export const diagnoseFetch = async (url, options = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[DIAGNOSE] ${timestamp} - Starting fetch to: ${url}`);
  console.log(`[DIAGNOSE] Method: ${options.method || 'GET'}`);
  console.log(`[DIAGNOSE] Headers:`, options.headers || {});
  console.log(`[DIAGNOSE] Body:`, options.body ? JSON.stringify(options.body) : 'none');

  try {
    // Get token
    const token = typeof window !== 'undefined' ? localStorage.getItem('valise_token') : null;
    console.log(`[DIAGNOSE] Token in localStorage:`, token ? `${token.substring(0, 20)}...` : 'NOT FOUND');

    const response = await fetch(url, options);
    console.log(`[DIAGNOSE] Response status: ${response.status} ${response.statusText}`);
    console.log(`[DIAGNOSE] Response headers:`, {
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    });

    const data = await response.json();
    console.log(`[DIAGNOSE] Response body:`, data);

    if (!response.ok) {
      console.error(`[DIAGNOSE] ✗ Request failed`);
      return { success: false, status: response.status, data };
    }

    console.log(`[DIAGNOSE] ✓ Request successful`);
    return { success: true, status: response.status, data };
  } catch (error) {
    console.error(`[DIAGNOSE] ✗ Fetch error:`, error.message);
    return { success: false, error: error.message };
  }
};

export const diagnosticAuthFetch = (url, options = {}) => {
  console.log(`[DIAGNOSE-AUTH] Creating authenticated fetch to: ${url}`);
  
  if (typeof window === 'undefined') {
    console.error('[DIAGNOSE-AUTH] Window object not available (SSR?)');
    throw new Error('Window object not available');
  }

  const token = localStorage.getItem('valise_token');
  console.log(`[DIAGNOSE-AUTH] Token found:`, !!token);
  if (!token) {
    console.error('[DIAGNOSE-AUTH] ✗ No token in localStorage');
    throw new Error('No authentication token found');
  }

  const finalOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  console.log(`[DIAGNOSE-AUTH] Final options:`, {
    method: finalOptions.method,
    headers: {
      ...finalOptions.headers,
      Authorization: `${finalOptions.headers.Authorization.substring(0, 20)}...`,
    },
    body: options.body ? JSON.stringify(options.body) : 'none',
  });

  return diagnoseFetch(url, finalOptions);
};
