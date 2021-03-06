#!/usr/bin/env node

"use strict";

// package includes
const         fs = require("fs");
const       path = require("path");
const       http = require("http");
const      https = require("https");
const    express = require("express");
const bodyParser = require("body-parser");

// initialize the needed libs
const    app = require("express")();

// own files
const      showHandler = require("./utils/show.js");
const     errorHandler = require("./utils/error.js");
const      fileHandler = require("./utils/file.js");
const parameterHandler = require("./utils/parameters.js");

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// load the main config file
const        config = require("./config.json");
const packageConfig = require("./package.json");

// check the folder path from the configuration
if (!fileHandler.validateDir(config.folder)) {
    console.log("The given music folder path is invalid");
    process.exit(1);  // there was an error, exit with code 1
}

// for cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allowedCors);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// simple api info
var apiInfo = {
    "_info": packageConfig.description,
    "_version": packageConfig.version
};

if (config.protocols.http) {
    var httpServer = http.createServer(app);
    httpServer.listen(config.port, () => {
        if (config.verbose) console.log("API started on " + config.port);
    });
}

if (config.protocols.https) {
    var httpsServer = https.createServer({
        cert: fs.readFileSync(path.resolve(config.ssl.certificate)),
        key: fs.readFileSync(path.resolve(config.ssl.key))
    }, app);
    httpsServer.listen(config.sslPort, () => {
        if (config.verbose) console.log("API started on " + config.sslPort);
    });
}


// favicon
app.get(["/favicon.ico", "/favicon*", "/icon*"], (req, res) => {
    res.sendFile(path.resolve(config.icon));
});

// file request
app.get("/file", (req, res) => {

    // needed parameters list
    let neededParameters = ["path"];

    // check if all parameters are present
    let missingParametersList = parameterHandler.missingParameters(neededParameters, Object.keys(req.query));
    if (missingParametersList.length != 0) {
        res.send(errorHandler.buildErrorObject(parameterHandler.errorStringMissingParameters(missingParametersList)));
        return;
    }

    // check if there is a empty needed parameter
    let missingIndex = parameterHandler.emptyParameters(neededParameters, req.query);
    if (missingIndex !== null) {
        res.send(errorHandler.buildErrorObject(parameterHandler.errorStringEmptyParameter(neededParameters[missingIndex])));
        return;
    }

    // extract the needed parameters
    let pathNow = req.query.path;
    // validate the path
    pathNow = fileHandler.validatePath(config.folder, pathNow);

    // create the relative path between folder and requested path
    let relativeAddition = path.relative(config.folder, pathNow);

    // check if is a file and valid
    if (!fileHandler.validateFile(pathNow) || !fileHandler.isValidFile(pathNow, config.allow)) {
        res.send(errorHandler.buildErrorObject("Given path is invalid"));
        return;
    }

    // file is valid
    // serve it
    res.sendFile(pathNow);

});

// directory
app.post("/list", (req, res) => {

    // needed parameters list
    let neededParameters = ["path"];

    // check if all parameters are present
    let missingParametersList = parameterHandler.missingParameters(neededParameters, Object.keys(req.body));
    if (missingParametersList.length != 0) {
        res.send(errorHandler.buildErrorObject(parameterHandler.errorStringMissingParameters(missingParametersList)));
        return;
    }

    // extract the needed parameters
    let pathNow = req.body.path;

    // if is empty fill with the root symbol
    if (!pathNow) pathNow = path.sep;

    // validate the path
    pathNow = fileHandler.validatePath(config.folder, pathNow);

    // create the relative path between folder and requested path
    let relativeAddition = path.relative(config.folder, pathNow);

    // check if is really a path
    if (!fileHandler.validateDir(pathNow)) {
        res.send(errorHandler.buildErrorObject("Given path is invalid"));
        return;
    }

    // all is valid
    // now create the file list object that will be returned
    let fileListObject = fileHandler.returnDirValidContents(pathNow, relativeAddition, config.allow, config.directoryId);

    // return the found items
    res.send(showHandler.list(fileListObject));

});

// basic api information
app.all(["*", "/"], (req, res) => {
    res.send(apiInfo);
});
