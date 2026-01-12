
import Parameter from "../ValueObject/Parameter.js"

class Endpoint {
    constructor({ 
        path = "/",
        inputObjektraEntries = null,
        outputObjektraEntries = null,
        queries = []                    //An array of query  object
    })
    {
        this.pathTemplate = path;   // "/posts/{accountId}"
        this.path = path;           // path display / used
        this.pathHTMLNode = null

        this.inputObjektraEntries = inputObjektraEntries;
        this.outputObjektraEntries = outputObjektraEntries;

        this.queries = queries;
        this.params = this.extractParams();
    }

    
    resolvePath() {
        let p = this.template;
        this.params.forEach(param => {
        if (param.value) {
            p = p.replace(`{${param.key}}`, param.value);
        }
        });
        return p;
    }

    extractParams() {
        const regex = /\{([^}]+)\}/g;
        const matches = [...this.pathTemplate.matchAll(regex)];

        return matches.map(match => {
            const paramName = match[1];

            return new Parameter({
                key: paramName,
                inputEventCallback: (value) => {
                    this.updatePath();
                }
            });
        });
    }

    updatePath() {
        let newPath = this.pathTemplate;

        this.params.forEach(p => {
            const replacement = p.value
                ? p.value
                : `{${p.key}}`;

            newPath = newPath.replace(`{${p.key}}`, replacement);
        });

        this.path = newPath;
        if(this.pathHTMLNode)
            this.pathHTMLNode.textContent = newPath
    }

    getPathHTMLNode(){
        if(this.pathHTMLNode){
            return this.pathHTMLNode
        }

        this.pathHTMLNode = document.createElement("div");
        this.pathHTMLNode.className = "endpoint";
        this.pathHTMLNode.textContent = this.path;
        
        return this.pathHTMLNode
    }


    getQueriesStringinfied() {
        if (!Array.isArray(this.queries) || this.queries.length === 0) {
            return "";
        }

        const params = this.queries
            .filter(q => q.value !== null && q.value !== "")
            .map(q => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`);

        return params.length ? `?${params.join("&")}` : "";
    }

}

export default Endpoint