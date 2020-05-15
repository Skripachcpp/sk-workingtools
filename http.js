export async function httpPost(url, body, {headers, token} = {}) {
  const tokenHeader = token && { Authorization: 'Bearer ' + token } || {};
  const postHeaders = { ...headers, ...tokenHeader };
  
  let response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      ...postHeaders
    },
    body: JSON.stringify(body)
  });

  let data = await response.json();

  return data;
}

export function urlConcat(url, relativeUri) {
  if (relativeUri && url) {
    if (relativeUri[0] !== '/' && url[url.length - 1] !== '/')
      relativeUri = '/' + relativeUri;
    else if (relativeUri[0] === '/' && url[url.length - 1] === '/')
      relativeUri = relativeUri.substring(1);
  }

  let fullUrl = url + relativeUri;
  return fullUrl;
}