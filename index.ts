import { serve, ServerRequest } from "http/server.ts";

const addr = "localhost:9090";
const url = `http://${addr}/`;

const server = serve(addr);
const headers = new Headers();
headers.append("Content-Type", "application/json");

const proxyRequest = async (req: ServerRequest, body: string) => {
  console.log(`${req.method} ${req.url} (PROXY to ${url})`);
  const response = await fetch(url, {
    method: req.method,
    headers: req.headers,
    body,
  });
  const { status, headers } = response;
  const responseBody = await response.text();
  req.respond({ status, headers, body: responseBody });
};

console.log(`Listening on ${url}`);
for await (const req of server) {
  console.log(`${req.method} ${req.url}`);
  const bodyRaw = await Deno.readAll(req.body);
  const body = new TextDecoder().decode(bodyRaw);
  if (req.url === "/proxy") proxyRequest(req, body);
  else {
    req.respond(
      {
        headers,
        body: JSON.stringify({ result: "ok", body }),
      },
    );
  }
}

// curl -d '{"deno": "land"}' -H "Content-Type: application/json" -X POST http://localhost:9090/proxy
