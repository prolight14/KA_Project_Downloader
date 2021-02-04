const scratchpadsUrl = "https://www.khanacademy.org/api/internal/scratchpads/";

const projectStructure = {
    "css": {
        "index.css": "https://raw.githubusercontent.com/prolight14/PJSLoader/master/css/index.css"
    },
    "js": {},
    "libraries": {
        "PJSLoader.js": "https://raw.githubusercontent.com/prolight14/PJSLoader/master/libraries/PJSLoader.js",
        "processing.js": "https://raw.githubusercontent.com/prolight14/PJSLoader/master/libraries/processing.js"
    },
    "index.html": "https://raw.githubusercontent.com/prolight14/PJSLoader/master/index.html"
};

let outProjectStructure = {
    "css": {},
    "js": {},
    "libraries": {},
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) 
{
    loadCode(function()
    {
        retrieveProjectJSON(request.scratchpadId, function(json)
        {
            console.log(request.scratchpadId);

            var dataOut = buildProject(json);

            downloadProject(dataOut.name, dataOut.zip);

            console.log(json);
            console.log(outProjectStructure);
        });
    });         
});

function buildProject(json)
{
    let zip = new JSZip();
    let name = json.nodeSlug.replace("p/", "");

    let master = zip.folder(name);

    if(json.userAuthoredContentType === "webpage")
    {
        master.file("index.html", json.revision.code);
    }
    else if(json.userAuthoredContentType === "pjs")
    {
        let css = master.folder("css");
            css.file("index.css", outProjectStructure["css"]["index.css"]);

        let js = master.folder("js");
            js.file("index.js", alignCode(json.revision.code));

        let libraries = master.folder("libraries");
            libraries.file("PJSLoader.js", outProjectStructure["libraries"]["PJSLoader.js"]);
            libraries.file("processing.js", outProjectStructure["libraries"]["processing.js"]);

        master.file("index.html", outProjectStructure["index.html"]);
    }

    master.file("scratchpad.json", JSON.stringify(json));

    return {
        name: name,
        zip: zip
    };
}

function alignCode(code)
{
    return "function main()\n{" + code.toString() + "\n\n} PJSLoader.loadSketch(\"canvas\", main);";
}

function downloadProject(name, zip)
{
    zip.generateAsync({type: "blob"}).then(function(content) 
    {
        saveAs(content, name + ".zip");
    });
}

function retrieveProjectJSON(scratchpadId, callback)
{
    $.ajax(scratchpadsUrl + scratchpadId,
    {
        type: 'GET',
        dataType: 'json',

        success: function(json) 
        {
            callback(json);
        }
    });
}

function retrieveRepoFile(url, callback)
{
    $.ajax(url,
    {
        type: 'GET',

        success: function(content)
        {
            callback(content);
        }
    });
}

function loadCode(callback)
{
    retrieveRepoFile(projectStructure["css"]["index.css"], function(content)
    {
        outProjectStructure["css"]["index.css"] = content.toString();

        retrieveRepoFile(projectStructure["libraries"]["PJSLoader.js"], function(content)
        {
            outProjectStructure["libraries"]["PJSLoader.js"] = content.toString();

            retrieveRepoFile(projectStructure["libraries"]["processing.js"], function(content)
            {
                outProjectStructure["libraries"]["processing.js"] = content.toString();

                retrieveRepoFile(projectStructure["index.html"], function(content)
                {
                    outProjectStructure["index.html"] = content.toString();

                    callback();
                });
            });
        });
    });
}