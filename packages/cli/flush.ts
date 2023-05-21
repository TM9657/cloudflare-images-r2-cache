import fs from "fs"
import path from "path"

async function main(){
    try{
        const config = fs.readFileSync(path.join(__dirname, "..", "..", "config.json"), "utf-8")
        const configJSON = JSON.parse(config)
        configJSON.accountHash = "";
        configJSON.bucketDomain = "";
        configJSON.secret = "";
        configJSON.maxKB = 400;
        fs.writeFileSync(path.join(__dirname, "..", "..", "config.json"), JSON.stringify(configJSON, null, 4));
        console.log("Successfully wrote to config.json")
    }catch(e){
        console.error("Failed to write to config.json, please manually configure the file!")
    }

    try{
        const wrangler = fs.readFileSync(path.join(__dirname, "..", "..", "worker", "image", "wrangler.toml"), "utf-8")
        const changed = wrangler.split("bucket_name = '")[0] + "bucket_name = 'images-cache'" + wrangler.split("bucket_name = '")[1].split("'")[1]
        fs.writeFileSync(path.join(__dirname, "..", "..", "worker", "image", "wrangler.toml"), changed)
        console.log("Successfully wrote to wrangler.toml")
    }catch(e){
        console.error("Failed to write to wrangler.toml, please manually configure the file!")
    }
}

main().catch(console.error).finally(() => process.exit(0))