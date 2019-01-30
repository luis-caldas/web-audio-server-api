"use strict";

const missingParameters = (parametersNeeded, parametersReceived) => {

    // list that will have the non present parameters
    let nonPresent = [];

    // iterate the needed parameters
    for (let i = 0; i < parametersNeeded.length; ++i)
        if (parametersReceived.indexOf(parametersNeeded[i]) === -1)
            nonPresent.push(parametersNeeded[i]);

    return nonPresent;

}

const errorStringMissingParameters = (missingParameters) => {

    let pluralOrNot = ((missingParameters.length > 1) ? "s " : " ");
    return "Parameter" + pluralOrNot + missingParameters.join(", ") + " needed";

}

const errorStringEmptyParameter = (emptyParameter) => {
    return "Parameter " + emptyParameter + " cannot be empty";
}

// functions to be exported
module.exports = {
    missingParameters: missingParameters,
    errorStringMissingParameters: errorStringMissingParameters,
    errorStringEmptyParameter: errorStringEmptyParameter
};
