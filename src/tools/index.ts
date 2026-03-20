import { downloadAudioTool, handleDownloadAudioTool } from "./downloadAudio.js";
import { searchTool, handleSearchTool } from "./searchVideo.js";
import {
  getPlaylistUrlsTool,
  handleGetPlaylistUrlsTool,
} from "./getPlaylistUrls.js";


export const tools = [searchTool, downloadAudioTool, getPlaylistUrlsTool];

export async function handleTool(name:string, args:any){
    switch(name){
        case "search_videos":
            return handleSearchTool(args);
        case "download_audio":
            return handleDownloadAudioTool(args);
        case "get_playlist_urls":
            return handleGetPlaylistUrlsTool(args);
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}