"use strict";

const info = (infoString) => {
    return {"_info": infoString};
};

const list = (listData) => {
    return {
        files: listData
    };
}

// functions to be exported
module.exports = {
    info: info,
    list: list
};
