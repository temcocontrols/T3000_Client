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

## Test Program

```
10 REM *********INITIALIZE THE TEST ***************
20 IF TIME-ON ( INIT ) > 00:00:05 AND METERTOT < 1 THEN STOP INIT
30 REM ******** BTU METER **********
40 REM RESET THE FLOW METER TOTALIZER BY WRITING 1 TO REGISTER 136
50 IF INIT THEN 19.253.REG136 = 1
60 REM GET FLOW TOTAL ***
70 METER_HI = 19.253.REG132 / 1000
80 METER_LO = 19.253.REG131 / 1000
90 METERTOT = 65536 * METER_HI + METER_LO
100 REM READ THE METER TEMPS ************
110 BTUSUP = 19.253.REG108 / 10
120 BTURET = 19.253.REG107 / 10
130 REM ****** READ THE TANK1 WEIGH SCALE ***************
140 IF INTERVAL ( 00:00:02 ) THEN WEIGHT = COM1 ( 9600 , 1 , 82 )
150 REM **************** WEIGHT READINGS **************
160 REM AT THE BEGINNING OF THE TEST, STORE THE WT IN STARTWT
170 REM CONTINUOUSLY UPDATE THE ENDWT TO THE CURRENT WT
180 REM AND AT THE END OF THE TEST, STORE THE ENDWT
190 IF NOT SWITFLOW THEN ENDWT = WEIGHT
200 REM ******START THE COUNTERS AGAIN
210 SCALETOT = SCALTOT2 + PUMPNOW
220 IF- SWITFLOW THEN STARTWT = WEIGHT
230 IF- SWITFLOW THEN SCALTOT2 = SCALETOT
240 REM ** IF INIT IS TRUE, KEEP THE PUMPS OFF FOR NOW *****
250 IF INIT THEN SCALTOT2 = 0
260 IF INIT THEN SCALETOT = 0
270 IF INIT THEN PUMPNOW = 0
280 IF INIT THEN STARTWT = WEIGHT
290 REM ************* MATH ************
300 IF NOT INIT THEN PUMPNOW = ABS ( WEIGHT - STARTWT )
310 IF INIT THEN PUMPNOW = 0
320 ERRORKG = SCALETOT - METERTOT
330 REM *** AT THE BEGINNING OF THE TEST, ERROR IS BIG, LIMIT TO SMALL VALUES
340 IF INIT THEN ERRORKG = 0
350 IF METERTOT < 20 THEN ERRORKG = MAX ( -1 , MIN ( 1 , ERRORKG ) )
360 IF METERTOT > 20 THEN ERRORPCT = ERRORKG / METERTOT * 100 ELSE ERRORPCT = 0
```
