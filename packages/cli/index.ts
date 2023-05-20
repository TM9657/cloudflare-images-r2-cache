import fs from "fs"
import path from "path"
import readline from "readline"
import {exec} from "child_process"
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const prompt = (question: string) => new Promise<string>(resolve => rl.question(question, resolve))

async function main(){
    console.log("👋 Welcome to Cache Initialization!");
    const accountHash = await prompt("What is your Account-Hash (found at your Images tab in the console): ")
    const bucketDomain = await prompt("What is the public bucket URI (e.g. cdn.example.com)[You can setup the custom domain in cloudflare later]: ")
    const bucketName = await prompt("What is your bucket name? (default: images-cache): ")
    const parsedBucketName = bucketName === "" ? "images-cache" : bucketName
    const createBucket = (await prompt("Would you like to create the bucket now? (y/n): ")).toLowerCase()
    const CF_Auth_Key = await prompt("What is your Cloudflare Auth Key? (found at https://dash.cloudflare.com/profile/api-tokens): ")
    const CF_Auth_Mail = await prompt("What is your Cloudflare Auth Email?: ")

    console.log("🔥 Writing to config.json...")
    try{
        const config = fs.readFileSync(path.join(__dirname, "..", "..", "config.json"), "utf-8")
        const configJSON = JSON.parse(config)
        configJSON.accountHash = accountHash;
        configJSON.bucketDomain = bucketDomain;
        fs.writeFileSync(path.join(__dirname, "..", "..", "config.json"), JSON.stringify(configJSON, null, 4));
        console.log("✅ Successfully wrote to config.json")
    }catch(e){
        console.error("💀 Failed to write to config.json, please manually configure the file!")
    }

    console.log("🔥 Writing to wrangler.toml...")
    try{
        const wrangler = fs.readFileSync(path.join(__dirname, "..", "..", "worker", "image", "wrangler.toml"), "utf-8").replace("images-cache", parsedBucketName)
        fs.writeFileSync(path.join(__dirname, "..", "..", "worker", "image", "wrangler.toml"), wrangler)
        console.log("✅ Successfully wrote to wrangler.toml")
    }catch(e){
        console.error("💀 Failed to write to wrangler.toml, please manually configure the file!")
    }

    console.log("🔥 Creating .env File...")
    try{
        fs.writeFileSync(path.join(__dirname, "..", "..", ".env"), `CLOUDFLARE_AUTH_KEY=${CF_Auth_Key}\nCLOUDFLARE_AUTH_EMAIL=${CF_Auth_Mail}`)
        console.log("✅ Successfully wrote to .env")
    }catch(e){
        console.error("💀 Failed to write to .env, please manually configure the file!")
    }

    if(createBucket !== "y" && createBucket !== "yes") {
        console.log("⏭️ Skipping bucket creation...")
        console.log("❤️ DONE :) Please leave a star in our github repo if you like the project!! ❤️")
        return;
    }

    console.log("🔥 Creating bucket...")

    await new Promise((resolve, reject) => {
        exec(`npx wrangler r2 bucket create ${parsedBucketName}`, (err, stdout, stderr) => {
            if(err) {
                console.error("💀 Failed to create bucket, please manually create it!")
                resolve(null)
                return;
            }
            console.log("✅ Successfully created bucket!")
            console.log("❤️ DONE :) Please leave a star in our github repo if you like the project!! ❤️")
            resolve(null)
            return;
        })
    })
    return;
}

main().catch(console.error).finally(() => process.exit(0))