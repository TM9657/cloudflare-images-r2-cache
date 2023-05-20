<a href="https://tm9657.de?ref=github"><p align="center"><img width=250 src="https://cdn.tm9657.de/tm9657/images/images_r2_cache.png" /></p></a>
<p align="center">
    <a href="https://tm9657.de"><img src="https://img.shields.io/badge/website-more_from_us-C0222C.svg?style=flat&logo=PWA"> </a>
	  <a href="https://discord.ca9.io"><img src="https://img.shields.io/discord/673169081704120334?label=discord&style=flat&color=5a66f6&logo=Discord"></a>
	  <a href="https://twitter.com/tm9657"><img src="https://img.shields.io/badge/twitter-follow_us-1d9bf0.svg?style=flat&logo=Twitter"></a>
	  <a href="https://www.linkedin.com/company/tm9657/"><img src="https://img.shields.io/badge/linkedin-connect-0a66c2.svg?style=flat&logo=Linkedin"></a>
    <a href="https://merch.ca9.io"><img src="https://img.shields.io/badge/merch-support_us-red.svg?style=flat&logo=Spreadshirt"></a>
</p>

# 📸️ 📦️ Cloudflare Images Buffer
Using Cloudflare Images + R2 Storage to add a caching layer for variants **(looking at you 1$ / 100k deliveries)**.
The first time an image is requested is redirected to images, after that the image is stored in r2. Future requests are redirected to R2.

## 📦️ Installation
```
0. clone the repo
1. pnpm install
2. pnpm run initialize
3. pnpm run build
```

## 📦️ Notes
- Turborepo is absolute overkill for this project

**Provided by TM9657 GmbH with ❤️**
### Check out some of our products:
- [Kwirk.io](https://kwirk.io?ref=github) (Text Editor with AI integration, privacy focus and offline support)