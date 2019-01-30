"use strict";

// requires
const path = require("path");
const fs   = require("fs");

const isPathConfigRoot = (rootDirectory, supposedDirectory) => {
    return path.resolve(rootDirectory) == path.resolve(supposedDirectory);
}

const getFileExtension = (filePath) => {
    return path.extname(filePath).substring(1);
}

const validatePath = (rootDirectory, supposedDirectory) => {

    // join to the root directory
    let fullGivenDir = path.resolve(path.join(rootDirectory, supposedDirectory))

    // resolve the root
    let resolvedRootDirectory = path.resolve(rootDirectory);

    // get both directories split
    let splitRoot     = resolvedRootDirectory.split(path.sep);
    let splitSupposed = fullGivenDir.split(path.sep);

    // iterate the root and compare with the supposed
    for (let i = 0; i < splitRoot.length; ++i)
        if (splitRoot[i] !== splitSupposed[i])
            return null;

    // the path is good
    return fullGivenDir;

};

const validateDir = (supposedDirectory) => {
    return fs.existsSync(supposedDirectory) && fs.lstatSync(supposedDirectory).isDirectory();
};

const returnDirValidContents = (dirPath, relativeAddition, allowedTypes, directoryIdentificator) => {

    // items paths and their types
    let listItems = [];

    // all contents in the dir
    let dirContents = fs.readdirSync(dirPath);

    for (let i = 0; i < dirContents.length; ++i) {

        // build the full path
        let fullPath = path.resolve(path.join(dirPath, dirContents[i]));

        // check if is dir
        if (validateDir(fullPath)) {
            listItems.push([dirContents[i], directoryIdentificator]);
            continue;
        }

        // get the file extension
        let fileExtNow = getFileExtension(dirContents[i]);

        // match the returned extension and add to the allowed items if match
        let allowedKeys = Object.keys(allowedTypes);

        // iterate the types
        for (let j = 0; j < allowedKeys.length; ++j) {

            // simplify references
            let listExt = allowedTypes[allowedKeys[j]];

            // search for extension
            let foundResult = listExt.indexOf(fileExtNow);

            if (foundResult != -1) {
                listItems.push([path.join(relativeAddition, dirContents[i]), allowedKeys[j]]);
                break;
            }

        }

    }

    return listItems;
}

// functions to be exported
module.exports = {
    validatePath: validatePath,
    validateDir: validateDir,
    returnDirValidContents: returnDirValidContents
};
