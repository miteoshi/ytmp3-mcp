import { downloadAudioTool, handleDownloadAudioTool } from "./downloadAudio.js";
import { searchTool, handleSearchTool } from "./searchVideo.js";

export const tools = [searchTool, downloadAudioTool];

export async function handleTool(name:string, args:any){
    switch(name){
        case "search_videos":
            return handleSearchTool(args);
        case "download_audio":
            return handleDownloadAudioTool(args);
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}