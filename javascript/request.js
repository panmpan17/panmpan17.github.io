class HTTPResponse {
    constructor(status, responseText) {
        this.status = status;
        this.text = responseText;
    }

    jsonlizeText() {
        try {
            return JSON.parse(this.text);
        }
        catch (e) {
            return null;
        }
    }
}



function Get({ url, data, success, error }) {
    let request = new XMLHttpRequest();
    request.addEventListener("load", function () {
        if (this.status >= 400) {
            if (error != null) error(new HTTPResponse(this.status, this.responseText));
        }
        else {
            if (success != null) success(new HTTPResponse(this.status, this.responseText));
        }
    });
    request.addEventListener("error", function () {
        error(new HTTPResponse(this.status, this.responseText));
    });

    if (data != null) {
        let key = GetCookie("key");
        if (data.key == undefined && key != "") data.key = key;
        url += "?" + stringlizeDictionary(data);
    }

    request.open("GET", url, true);
    request.send();
}

function Post({ url, data, success, error }) {
    let request = new XMLHttpRequest();
    request.addEventListener("load", function () {
        if (this.status >= 400) {
            if (error != null) error(new HTTPResponse(this.status, this.responseText));
        }
        else {
            if (success != null) success(new HTTPResponse(this.status, this.responseText));
        }
    });
    request.addEventListener("error", function () {
        error(new HTTPResponse(this.status, this.responseText));
    });

    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    if (data != null) {
        let key = GetCookie("key");
        if (data.key == undefined && key != "") data.key = key;
    }
    request.send(JSON.stringify(data));
}
