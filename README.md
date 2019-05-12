# Exohunter electron client

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

## Full documentation of Exohunter can be downloaded here

[Exohunter.pdf](https://breinsp.github.io/res/exohunter.pdf)

## Notes

Exohunter server is necessary for the client to work. Server repository can be found [here](https://github.com/breinsp/exohunter-server)