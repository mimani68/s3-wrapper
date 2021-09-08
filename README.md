# File Manager service

## Features

* S3 compatible (MINIO)
* Implemet 12factor pricnciple
* Social media adaptors (slack, twitter)
* Control over incoming files with extentions
* Dockerized
* Api test (e2e) using `bash script`
* Authentication using `Http external` and `redis internal` mechanizem
* Compatible with modern webserver
* Gitlab CICD frindly
* Monitroing system using `Sentry.io` and `APM` adaptors
* Auto documentation
* Swagger and Postman documentation
* Image manipulation like `rename`, `rotate`, `resize` and ...
* Using external shell files with external api
* Many automated scripts with `Makefile` tool


## Development

First check system local system compability
```bash
cd projectFolder
make doctor
```

For more convinent recommended to use aliase as shoutcut for use in command line
```bash
alias m="make"
alias mt="make -f Makefile-test"
alias mn="make -f Makefile-node"
```

For launch the application in development mode that is enough to use the below command.
```bash
make -f Makefile-node clean
make -f Makefile-node install
```

## Start project (dev)

Start this service by getting this command.
```bash
make up
```

### Shutdown development
```bash
make down
```

### Debuging with visual studio code

Debuging process started with simple configuration file that created before and ready to use
```
vscode > F5
```

> Just remember to use `Docker: Attach to Node` mode and ensure port `9229` being open.



## Testing

```bash
make -f Makefile-test upload
```
