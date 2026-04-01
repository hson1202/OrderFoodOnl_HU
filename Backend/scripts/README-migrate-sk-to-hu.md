# MongoDB migration: legacy SK locale → Hungarian (HU)

Script: `migrate-sk-to-hu.js`

## Before production

1. **Back up** the database (dump or snapshot).
2. Deploy application code that expects `nameHU` / `labelHU` / `titleHU` and `language: 'hu'` first, or run migration during a maintenance window immediately before/after deploy.

## Run

From the `Backend` directory (with `.env` containing `MONGODB_URI`, `MONGO_URI`, or `DATABASE_URL`):

```bash
node scripts/migrate-sk-to-hu.js
```

## What it does

- Unsets legacy `nameSK` on `foods` and nested `options[].nameSK`, `options[].choices[].labelSK`.
- Unsets `nameSK` on `parentcategories`.
- Sets `categories` and `parentcategories` with `language: 'sk'` to `'hu'`.
- Unsets `titleSK` on `blogs`; sets `language: 'sk'` to `'hu'`.
- On `restaurantinfos`: if `translations.sk` exists, copies it to `translations.hu` then removes `translations.sk`; otherwise only removes `translations.sk`.

## After migration

- Re-enter Hungarian copy in Admin for foods, blogs, and restaurant translations as needed (HU fields may be empty if you never filled them).
