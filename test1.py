from tools.search_tool import duckduckgo_search
from tools.flight_tool import search_flights
# from mcp_client_test import get_all_mcp_tools, get_ddg_search_tool, search_with_ddg
from mcp_client import get_all_mcp_tools
import asyncio

# test the duckduckgo_search function
"""
results = duckduckgo_search("What are best hotels in Addis Ababa?")
for result in results:
    print(result)
"Plan a 7 days Japan trip from Ethiopia"
result = search_flights("Plan a 7 days Japan trip from Ethiopia")
print(result)
"""


# test the search_flights function
"""
from backend import run_travel_planner

res = run_travel_planner("Plan a 7 days Japan trip from Ethiopia", "")
print(res)
"""

# what is default place if no place is given in the query for origin

# test the MCP client by running the get_all_mcp_tools function

if __name__ == "__main__":
    asyncio.run(get_all_mcp_tools())
    # result = asyncio.run(search_with_ddg("What are best hotels in Addis Ababa?"))
    # print(result)