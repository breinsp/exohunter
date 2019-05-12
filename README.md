# Electron client **ExoHunter**

## Setup

First install node_modules

```npm install```

Then run electron by executing following command

```npm start```

## Build standalone program

To package the electron app you need to use the electron-packager module

```npm install electron-packager -g```  

```electron-packager <sourcedir> <appname> --platform=<platform> --arch=<arch> [optional flags...]```

[More Info](https://github.com/electron-userland/electron-packager)

## Notes:

* K2DataProvider necessary for this app to run correctly (using REST interface)