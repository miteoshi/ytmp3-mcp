#!/usr/bin/env node


import {Server} from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import { CallToolRequest, CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"

import {tools, handleTool} from "./tools/index.js"

type RequestHandler = {
    url: string;
    language?: string;
    resolution?: string;
    startTime?: string;
    endTime?: string;
    query?: string;
    maxResults?: number;
    maxComments?: number;
    sortOrder?: "top" | "new";
    fields?: string[];
    uploadDateFilter?: string;
}

const server = new Server({
    name: "tuber", version:"1.0.0"
},{
    capabilities:{tools:{}}
})

//list tools
server.setRequestHandler(ListToolsRequestSchema, async () =>  {
    return {tools};
})



//call tools
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const toolName = request.params.name;
    const args = request.params.arguments as RequestHandler;

    try{
        return await handleTool(toolName,args)
    }catch(err:any){
        return {
            content: [{type:"text",text:err.message}],
            isError:true
        }
    }
});



//start server
async function startServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

// Start the server and handle potential errors
startServer().catch(console.error);


