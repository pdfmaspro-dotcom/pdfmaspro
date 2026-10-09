# PDF Master Pro — pdfmaspro.com

32 free PDF tools. No login, no limits. Built with React + Vite, hosted on Cloudflare Pages.

## Tech stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **PDF processing**: pdf-lib, pdfjs-dist, qpdf-wasm (all in-browser)
- **Hosting**: Cloudflare Pages (free)
- **API functions**: Cloudflare Pages Functions (`/functions/api/`)
- **Newsletter**: Kit (ConvertKit)
- **Email**: Resend
- **Payments**: Razorpay, UPI, PayPal

## Local development

```bash
npm install
cp .env.example .env        # fill in your keys
npm run dev                  # localhost:5173
```

> API functions (`/api/subscribe`, `/api/contact`) don't run with `npm run dev`.
> To test them locally: `npx wrangler pages dev dist --compatibility-date=2024-01-01`
> (first run `npm run build`, then the wrangler command)

## Deploy to Cloudflare Pages (first time)

1. Push this repo to GitHub
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**
3. Select your repo
4. Build settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
5. **Environment Variables** → add these (Settings → Environment Variables):

| Variable | Where to get it |
|---|---|
| `KIT_API_KEY` | kit.com → Settings → Developer |
| `KIT_FORM_ID` | kit.com → Forms → form URL number |
| `RESEND_API_KEY` | resend.com → API Keys |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Dashboard |
| `VITE_UPI_ID` | your UPI ID |
| `VITE_PAYPAL_USERNAME` | your PayPal username |

AdSense vars (`VITE_ADSENSE_*`) — leave empty until AdSense approves your site.

6. Click **Save and Deploy**

## Project structure

```
/
├── functions/
│   └── api/
│       ├── subscribe.js   # Newsletter signup (Kit)
│       └── contact.js     # Contact form (Resend)
├── public/
│   ├── _redirects         # SPA routing for Cloudflare Pages
│   ├── sitemap.xml
│   ├── robots.txt
│   └── ...
├── src/
│   ├── components/
│   ├── pages/
│   ├── tools/             # 32 PDF tools
│   ├── data/
│   └── utils/
├── scripts/
│   └── prerender.mjs      # Static prerender for SEO
├── .env.example
└── vite.config.js
```

## Subsequent deploys

Every push to `main` branch auto-deploys via Cloudflare Pages CI.
