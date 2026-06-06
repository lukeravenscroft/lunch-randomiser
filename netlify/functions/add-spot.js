const SPOTS_PATH = 'public/spots.json';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function createSpotId(name, existingIds) {
  const base = slugify(name) || 'spot';
  let candidate = base;
  let suffix = 2;

  while (existingIds.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function githubRequest(path, token, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message ?? 'GitHub request failed.';
    throw new Error(message);
  }

  return data;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    return jsonResponse(500, {
      error: 'Server is missing GitHub configuration.',
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body ?? '{}');
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body.' });
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const address = typeof payload.address === 'string' ? payload.address.trim() : '';

  if (!name || !address) {
    return jsonResponse(400, { error: 'Name and address are required.' });
  }

  try {
    const file = await githubRequest(
      `/repos/${owner}/${repo}/contents/${SPOTS_PATH}?ref=${branch}`,
      token,
    );

    const decoded = Buffer.from(file.content, 'base64').toString('utf8');
    const data = JSON.parse(decoded);
    const spots = Array.isArray(data.spots) ? data.spots : [];
    const existingIds = new Set(spots.map((spot) => spot.id));

    const spot = {
      id: createSpotId(name, existingIds),
      name,
      address,
    };

    spots.push(spot);

    const updatedContent = Buffer.from(
      `${JSON.stringify({ spots }, null, 2)}\n`,
      'utf8',
    ).toString('base64');

    await githubRequest(`/repos/${owner}/${repo}/contents/${SPOTS_PATH}`, token, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Add lunch spot: ${name}`,
        content: updatedContent,
        sha: file.sha,
        branch,
      }),
    });

    return jsonResponse(200, { spot });
  } catch (error) {
    return jsonResponse(500, {
      error: error instanceof Error ? error.message : 'Could not save spot.',
    });
  }
};
