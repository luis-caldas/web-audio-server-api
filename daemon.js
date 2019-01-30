#!/usr/bin/env node

"use strict";

// requires
const    path = require("path");
const nodemon = require("nodemon");

// my configuration
const config = require("./config.json");

// add the file to the daemon
nodemon({script: path.resolve(config.daemon.mainApp)});

// add some verbose
nodemon.on("start", function() {
    console.log("Daemon started service", config.daemon.mainApp);
}).on("quit", function() {
    console.log("Daemon stopped service", config.daemon.mainApp);
    process.exit();
}).on("restart", function(changedFiles) {
    console.log("Daemon restarted service due to", changedFiles);
});
