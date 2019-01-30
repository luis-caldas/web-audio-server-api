#!/usr/bin/env node

"use strict";

// package includes
const       path = require("path");
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

// simple api info
var apiInfo = {
    "_info": packageConfig.description,
    "_version": packageConfig.version
};

// app starting verbose
app.listen(config.port, () => {
    if (config.verbose) console.log("API started on " + config.port);
});

// favicon
app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.resolve(config.icon));
});

// file request
app.post("/file", (req, res) => {

    res.send("Not implemented");

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
