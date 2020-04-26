## ZHUO-ZHU-API

### Install essential npm packages

> npm i && cd client && npm i && cd ..

### Startup server in Production mode (after react app built)

> For Linux, macOS
> cd client && npm build && cd .. && pm2 start pm2.config.js --name PdfViewer
> or set env in cmd: env NODE_API_MODE=PROD npm run start
> or use custom script: npm run dev

> For Windows
> cd client && npm build && cd .. && set "NODE_API_MODE=PROD" npm run start


### Run Development mode

* Client:
> For Linux, macOS
> cd client && REACT_APP_API_MODE=DEV npm start

> For Windows (cmd.exe)
> cd client && set "REACT_APP_API_MODE=DEV" && npm start

> For Windows (Powershell)
> cd client; ($env:REACT_APP_API_MODE = "DEV") -and (npm start)


* Server:
> NODE_API_MODE=DEV npm run start

