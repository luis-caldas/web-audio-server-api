"use strict";

const buildErrorObject = (errorString) => {
    return {"_error": errorString};
};

// functions to be exported
module.exports = {
    buildErrorObject: buildErrorObject
};
