// handleGETRequests will concatanate all posts found in the kv namespace into an array of JSONs and return that array
async function handleGETRequests(request) {
  const url = new URL(request.url);
  switch (url.pathname) {
    case '/posts': {
      const keys_list = await my_kv.list();
      const keys = keys_list.keys
      if (keys.length == 0) {
        return new Response("No posts to display", {status: 200});
      }
      const posts = []
      for (const key of keys) {
        if (key.name != "id") {
          let post = await my_kv.get(key.name, {type: "json"})
          posts.push(post)
        }
      }
      const body = JSON.stringify(posts)
      return new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    default: {
      return new Response("Invalid request", {status: 404})
    }
  }
}

// handelePOSTRequests will put a post created from the request body in the kv namespace, after adding a unique id
async function handlePOSTRequests(request) {
  const url = new URL(request.url)
  switch (url.pathname) {
    case "/posts": {
      const post = await request.json()
      const id = await my_kv.get("id") || 0
      post.id = parseInt(id) + 1
      await my_kv.put("id", post.id)
      await my_kv.put(post.id, JSON.stringify(post))
      return new Response(null, {status: 204})
    }
    default: {
      return new Response("Invalid request", {status: 404})
    }
  }
}

async function handleRequest(request) {
  if (request.method == "GET") {
    return handleGETRequests(request)
  }
  if (request.method == "POST") {
    return handlePOSTRequests(request)
  }
  return new Response('Hello worker!', {
    headers: { 'content-type': 'text/plain' },
  })
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


