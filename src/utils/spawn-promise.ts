import {spawn} from 'child_process';

export function spawnPromise(command: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args);
        let stdout = '';
        let stderr = '';
        
        
        process.on('error', (err:any) => {
            reject(new Error(`Failed to spawn ${command}: ${err.message}`));
        })

        process.stdout.on('data',(data:any) => {
         
          stdout += data.toString();  
         
          
        })

        process.stderr.on('data',(data:any) => {
           
            stderr += data.toString();

            
        })

        process.on('close',(code:any)=> {
            if(code===0) resolve(stdout);
            else reject(new Error(`Failed with exit code: ${code}\n${stderr}\n${stdout}`));
        });
    });
}
