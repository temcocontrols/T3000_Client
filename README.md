# T3000 Client

This project is aimed at providing a client for T3000 Building Automation system. Users will be able to use the client from the browser or using the desktop/mobile version. All data is read and written to the database using an API in a stuctured way.

This web client made with [Quasar](https://quasar.dev/) framework

You need to install [T3000-API](https://github.com/temcocontrols/T3000-API-local-server-controller) on a Raspberry Pi or any normal PC in the same network as this web client to make it work because the web client needs the API to read/write the data.

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
