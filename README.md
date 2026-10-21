# JR Garage Door Service LLC — preview build

Single-page preview built 2026-10-21 to show the owner what a website would look like. **It is not
the live site and it is not connected to anything.**

- Local preview: `python3 -m http.server 8100` in this folder → http://127.0.0.1:8100/
- Public preview: https://cultur3ai.github.io/jr-garage-door-preview/

## What is on the page, and where it came from

Every sentence traces to `FACT-SHEET.md`. Nothing was invented: no licence number, no years in
business, no brands, no warranty, no 24/7 claim, no discount, no testimonial, no customer name.

| Element | Source |
|---|---|
| Business name, phone | their Facebook page, Yelp, their own directory listing |
| 402 reviews / 5.0 | Google Maps scrape 2026-10-21 (the same pull as the Martin County assessment) |
| Free estimates | their Facebook: "call us today at 772-877-3805 to schedule your free estimate" |
| Springs, rollers, openers, installation, repair | their Facebook + their directory category |
| Four towns + two counties | their Facebook ("St. Lucie County, Martin County") + the city list on their listing |
| Email `jrgaragedoorservyce@gmail.com` | decoded from the Cloudflare-obfuscated mailto on their own listing. **The spelling "servyce" is theirs** — do not correct it. |

## Deliberately absent

- **Photography.** We hold rights to none of their images, so the page is type- and illustration-led:
  the hero door is inline SVG drawn for this build.
- **`aggregateRating` in JSON-LD.** The 402/5.0 rating is Google's; marking it up risks a manual
  action. It stays visible page text only.
- **A street address.** 5920 NW Conus St appears on one directory only; the JSON-LD carries
  locality/region/country and nothing more.

## Needs the owner's confirmation before this could go live

1. **Hours.** `Mon–Fri 8:00am–5:00pm` comes from Yelp alone. The HTML carries
   `<!-- HOURS: confirm with owner -->` right after it.
2. **Service towns.** Palm City, Hobe Sound and Vero Beach were left off on purpose — one directory
   lists Vero, nothing confirms the other two.
3. **The email address.** It was published obfuscated on a third-party listing; worth confirming it
   is still the one they read.
4. **Whether they want the licence number shown.** Florida doesn't require one for this trade the way
   it does for a general contractor, so we left it out rather than borrow one.

## Files

```
index.html                 the page, all copy, JSON-LD (LocalBusiness + FAQPage)
assets/css/styles.css      design system: graphite/steel/paper/orange, Barlow + Barlow Condensed
assets/js/reveal.js        scroll reveals — arrive in 260ms, leave instantly
assets/js/door.js          hero door panels, one-time lift, counter animation
assets/fonts/*.woff2       Barlow + Barlow Condensed, self-hosted (OFL)
```

No external requests of any kind: fonts are local, the favicon is a data URI, the illustrations are
inline SVG, there is no analytics and no embed.

## Verified

- 360 / 390 / 414 / 768 / 1024 / 1440 / 1920 px: zero horizontal overflow at every width
- one `<h1>`; every tap target ≥44px at 390px; sticky call/email bar only at ≤640px
- zero requests to any third-party origin
- `prefers-reduced-motion: reduce`: no animation, reveals at full opacity, counters at final values
- no console errors, no failed requests
