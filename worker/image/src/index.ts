import {CorsResponse} from "util/cors";
import config from "../../../config.json"

export interface Env {
    IMAGES_CACHE: R2Bucket;
}

const Request_Cache: Map<string, boolean> = new Map()
const Account_Hash = config.accountHash;

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        const bucket = env.IMAGES_CACHE;
        const id = new URL(request.url).searchParams.get("id")?.replaceAll("/", "");
        const variant = new URL(request.url).searchParams.get("variant")?.replaceAll("/", "")

        if(request.method === "DELETE") {
            if(!id) return new CorsResponse("No id provided", 400).finalize(request);
            const secret = request.headers.get("authorization") || request.headers.get("Authorization");
            if(!secret || secret !== config.secret) return new CorsResponse("", 401).finalize(request);
            const keys = await bucket.list({
                prefix: `img/${id}`
            })
            try{
                await bucket.delete(keys.objects.map(object => object.key))
                return new CorsResponse("", 200).finalize(request);
            }catch(e){
                console.error(e)
                return new CorsResponse("", 500).finalize(request);
            }
        }

        if (!id || !variant) return new CorsResponse("No id or variant provided", 400).finalize(request);
        const Cache_Key = id + variant;
        const Reroute_URL = `${config.bucketDomain.startsWith("http") ? "" : "https://"}${config.bucketDomain}${config.bucketDomain.endsWith("/") ? "" : "/"}img/${id}/${variant}`;
        const Images_URL =  `${config.bucketDomain.startsWith("http") ? "" : "https://"}${config.bucketDomain}${config.bucketDomain.endsWith("/") ? "" : "/"}cdn-cgi/imagedelivery/${Account_Hash}/${id}/${variant}`;

        // Check our cache for the object -> Save on those valuable get requests if we can
        if (Request_Cache.has(Cache_Key) && Request_Cache.get(Cache_Key)) return new CorsResponse(Reroute_URL, 301).redirect(Reroute_URL, 301);
        if (Request_Cache.has(Cache_Key) && !Request_Cache.get(Cache_Key)) return new CorsResponse(Images_URL, 301).redirect(Images_URL, 301);

        const r2Object = await bucket.head(`img/${id}/${variant}`)

        // We can safely redirect to the cached image permanently
        if (r2Object && r2Object.size <= 1) {
            Request_Cache.set(Cache_Key, false)
            return new CorsResponse(Images_URL, 301).redirect(Images_URL, 301);
        }

        // We can safely redirect to the cached image permanently
        if (r2Object && r2Object.size > 1) {
            Request_Cache.set(Cache_Key, true)
            return new CorsResponse(Reroute_URL, 301).redirect(Reroute_URL, 301);
        }

        // Now we check our images for the item
        const image = await fetch(`https://imagedelivery.net/${Account_Hash}/${id}/${variant}`, {})

        if(!image.ok) console.log(`https://imagedelivery.net/${Account_Hash}/${id}/${variant} returned ${image.status} and ${image.statusText}`)
        if (!image.ok) return new CorsResponse("", 404).finalize(request);

        const headers = image.headers;

        if((headers.get("content-length") || Infinity) > config.maxKB * 1024) {
            try{
                const putOperation = await bucket.put(`img/${id}/${variant}`, new ArrayBuffer(1), {
                    httpMetadata: new Headers({
                        "content-type": headers.get("content-type") || "image/*",
                        "cache-control": headers.get("cache-control") || "public,max-age=31536000,stale-while-revalidate=7200",
                        "accept-ranges": headers.get("accept-ranges") || "*",
                    })
                });
                Request_Cache.set(Cache_Key, false)
                return new CorsResponse(Images_URL, 301).redirect(Images_URL, 301);
            }catch(e){
                console.error(e)
                return new CorsResponse("", 500).finalize(request);
            }
        }

        try {
            const putOperation = await bucket.put(`img/${id}/${variant}`, image.body, {
                httpMetadata: new Headers({
                    "content-type": headers.get("content-type") || "image/*",
                    "content-length": headers.get("content-length") || "0",
                    "cache-control": headers.get("cache-control") || "public,max-age=31536000,stale-while-revalidate=7200",
                    "accept-ranges": headers.get("accept-ranges") || "*",
                })
            });
            Request_Cache.set(Cache_Key, true)
            return new CorsResponse(Reroute_URL, 301).redirect(Reroute_URL, 301);
        } catch (e) {
            console.error(e)
            return new CorsResponse("", 500).finalize(request);
        }
    },
};
