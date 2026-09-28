# Development Guide

This page is retained for links from earlier project material. Use the maintained guides below:

- [Local development workflow](../DEVELOPMENT_GUIDE.md)
- [Local database setup](../database/DATABASE_SETUP.md)
- [Render deployment](../RENDER_DEPLOY.md)

The supported default is integrated development mode:

```bash
npm run dev
```

For separate Vite and API processes, use:

```bash
npm run dev:separate
```

Keep credentials in `.env.local`; it is intentionally excluded from Git.
