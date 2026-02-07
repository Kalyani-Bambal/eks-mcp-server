import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as k8s from "@kubernetes/client-node";

const server = new Server(
  {
    name: "eks-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Load kubeconfig (uses your working kubectl config)
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// 🔹 Tool Listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_pods",
        description: "List all pods in all namespaces",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// 🔹 Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "list_pods") {
    const res = await k8sApi.listPodForAllNamespaces();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            res.body.items.map((p) => p.metadata.name),
            null,
            2
          ),
        },
      ],
    };
  }

  return {
    content: [{ type: "text", text: "Unknown tool" }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);