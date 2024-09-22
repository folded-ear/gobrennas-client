# Brenna's Food Software Client

Do you use food? Do you use software? Brenna's Food Software is for you!

> Your _face_ is ~~a cookbook~~ food software!

## Build

You'll need Node 20 to build. A more specific version may be stipulated at some
point.

The easiest way is to install `nvm` (see https://github.com/nvm-sh/nvm ):

```bash
nvm install
npm install
npm run build
```

Now you'll have a nice ready-to-deploy website in the `build` directory! And
it's useless without an API to connect to.

## Run (For Development)

You'll need Node 20 to run, just like above. Assuming you've got an API running
at http://localhost:8080 (see https://github.com/folded-ear/gobrennas-api):

```bash
nvm install # if needed
npm install # if needed
npm start
```

That should have opened http://localhost:3001/ in your default browser, but if
not, click the link. The client isn't useful without an API; see above.

## Run (For Production)

That static website from the "Build" section is perfect! Stick it somewhere! Or
hit https://gobrennas.com/ to see it in action.
