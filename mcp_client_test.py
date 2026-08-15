import os
import asyncio
from fastmcp import FastMCP
import certifi
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient


os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
os.environ["PYTHONWARNINGS"] = "ignore"

load_dotenv()


# create the client and connect to the MCP servers
client = MultiServerMCPClient(
    {
        "ddg-search": {
            "command": "uvx",
            "args": ["duckduckgo-mcp-server"],
            "transport": "stdio", # stdio, sse, websocket, http
            # "url": "https://html.duckduckgo.com/html"
        },
        # other MCP servers can be added here

        # "tavily": {
        #     "transport": "streamable_http",
        #     "url": f"https://mcp.tavily.com/mcp/?tavilyApiKey={os.environ.get('TAVILY_API_KEY')}",
        # }
    }
)
# summarize steps to develop MCP: MCP client -> MCP server -> tool -> tool's API

# let me test it by writing a simple async function to get tools it is connected to and print them out

async def get_all_mcp_tools():
    tools = await client.get_tools()
    print("Connected MCP tools:")
    for tool in tools:
        print(f"- {tool.name}")


# there was search_tool when there was no MCP. But now we have MCP client, so we can use the MCP client to get the tools and use them directly. So we don't need search_tool anymore. (I can even delete it)


# now test it with another function that uses the duckduckgo_search tool to search for something and print the results
ddg_search_tool = None
async def get_ddg_search_tool():
    global ddg_search_tool
    if ddg_search_tool is not None:
        return

    tools = await client.get_tools()
    print("\nConnected MCP tools:")
    for tool in tools:
        print(f"- {tool.name}")
    # find the duckduckgo_search tool in the list of tools using a generator expression and next() function. If not found, return None
    ddg_search_tool = next(
        (tool for tool in tools if tool.name == "search"), None
    )

# Now we can use the duckduckgo_tool to search for something and print the results
# This function can be used inside the LLM agent tool calling.
async def search_with_ddg(query: str):
    await get_ddg_search_tool()
    result = await ddg_search_tool.ainvoke(
        {
            "query": query
        }
    )
    if hasattr(result, "content"):
        return "\n\n".join(item.text for item in result.content if hasattr(item, "text"))
    return result