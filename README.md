#

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is almost ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/node?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Finish your CI setup

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/rtuLBlFOCR)

## Run tasks

To run the dev server for your app, use:

```sh
npx nx serve auth-service
```

To create a production bundle:

```sh
npx nx build auth-service
```

To see all available targets to run for a project, run:

```sh
npx nx show project auth-service
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/node:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/node:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/node?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Deploying seller-ui and user-ui to Vercel

Create two Vercel projects, one for each Next.js app. Use these settings:

1. Project → Settings → General

   - Root Directory: `apps/seller-ui` (Project 1) and `apps/user-ui` (Project 2)
   - Framework Preset: Next.js
   - Node Version: 20 (we set `"engines": { "node": "20.x" }` in each app)
   - Install Command: leave default (`npm install`)
   - Build Command: leave default (`next build`)
   - Output Directory: leave default (managed by Next on Vercel)

2. Project → Settings → Environment Variables

   - seller-ui
     - `NEXT_PUBLIC_SERVER_URI` → Your API base URL (e.g. `https://api.example.com`)
     - `NEXT_PUBLIC_CHAT_WEBSOCKET_URI` → WebSocket URL (use `wss://.../chat` in prod)
     - `NEXT_PUBLIC_USER_UI_LINK` → Public URL of user-ui (e.g. `https://user.example.com`)
   - user-ui
     - `NEXT_PUBLIC_SERVER_URI` → Your API base URL (e.g. `https://api.example.com`)
     - `NEXT_PUBLIC_CHAT_WEBSOCKET_URI` → WebSocket URL (use `wss://.../chat` in prod)
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Your Stripe publishable key

3. (Optional) Ignore builds when a project has no changes
   - Project → Settings → Git → Ignored Build Step
   - Command:
     ```bash
     git diff --quiet ${VERCEL_GIT_PREVIOUS_SHA:-HEAD^} ${VERCEL_GIT_COMMIT_SHA:-HEAD} -- . || exit 1
     ```
   - This runs builds only when files in the project’s root directory changed.

Notes

- Each app has `build`/`dev` scripts and Node 20 engines in its `package.json`.
- Next Image remote host `ik.imagekit.io` is already allowed in both apps.
