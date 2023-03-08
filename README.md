# T3000 Client

The objective of this project is to develop a client for the T3000 Building Automation system. This client can be accessed through a web browser or a desktop/mobile version, providing users with greater convenience. To ensure proper management of data, all information is structured and stored in a database, which is accessed through an API.

To build this web client, we utilized the [Quasar](https://quasar.dev/) framework, which offers robust features and efficient development tools. However, it is important to note that the T3000-API must be installed on a Raspberry Pi or any normal PC within the same network as the web client. Without the API, the client won't work.

## Install Node.js

In order to build and run this app in development mode, you will need to have Node.js installed, so make sure you have it installed on your machine. You can download the latest version of Node.js from the official website: https://nodejs.org/

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

When the build finish you will get instructions how to run the web client.

### Build the desktop version

To build the desktop version you need to install Tauri CLI 

```bash
npm install @tauri-apps/cli -g
```

Then you can build the desktop app for production

```bash
tauri build
```

