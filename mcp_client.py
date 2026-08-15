import asyncio
import os
import certifi
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

load_dotenv()

# create the client and connect to the MCP servers
MCP_client = MultiServerMCPClient(
    {
        # DuckDuckGo MCP server
        "ddg-search": {
            "command": "uvx",
            "args": ["duckduckgo-mcp-server"],
            "transport": "stdio", # stdio, sse, websocket, http
            # "url": "https://html.duckduckgo.com/html"
        },
        # AviationStack MCP server
        "Aviationstack MCP": {
            "transport": "stdio",
            "command": "uvx",
            "args": [
                "--with", "mcp[cli]>=1.10.1,<2",
                "aviationstack-mcp"
            ],
            "env": {
                "AVIATION_STACK_API_KEY": os.environ.get("AVIATIONSTACK_API_KEY"),
          }
        }

    }
)

# get tools in the MCP client
async def get_all_mcp_tools():
    tools = await MCP_client.get_tools()
    print("Connected MCP tools:")
    for tool in tools:
        print(f"- {tool.name}")