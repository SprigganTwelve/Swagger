


/* ==========================
   HTML SVG
   ========================== */


const drawerSvg  = 
`<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="#000000" width="800px" height="800px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.256 8.606c0-0.269 0.106-0.544 0.313-0.75 0.412-0.412 1.087-0.412 1.5 0l14.119 14.119 13.913-13.912c0.413-0.412 1.087-0.412 1.5 0s0.413 1.088 0 1.5l-14.663 14.669c-0.413 0.413-1.088 0.413-1.5 0l-14.869-14.869c-0.213-0.213-0.313-0.481-0.313-0.756z"></path>
</svg>`


const reloadSvg  = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --><svg fill="#000000" width="800px" height="800px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M15.977 0c-7.994 0-14.498 6.504-14.498 14.498 0 7.514 5.79 13.798 13.236 14.44l-2.87 1.455c-0.354 0.195-0.566 0.632-0.355 0.977l0.101 0.262c0.211 0.346 0.668 0.468 1.021 0.274l4.791-2.453c0.006-0.004 0.012-0.003 0.019-0.007l0.322-0.176c0.177-0.098 0.295-0.257 0.342-0.434 0.049-0.177 0.027-0.375-0.079-0.547l-0.191-0.313c-0.003-0.006-0.009-0.010-0.012-0.015l-2.959-4.624c-0.21-0.346-0.666-0.468-1.021-0.274l-0.232 0.162c-0.354 0.194-0.378 0.694-0.168 1.038l1.746 2.709c-0.009-0-0.018-0.004-0.027-0.005-6.54-0.429-11.662-5.907-11.662-12.47 0-6.891 5.607-12.498 12.498-12.498 6.892 0 12.53 5.606 12.53 12.498 0 3.968-1.823 7.613-5 9.999-0.442 0.332-0.53 0.959-0.199 1.401 0.332 0.442 0.959 0.531 1.401 0.199 3.686-2.768 5.799-6.996 5.799-11.598-0-7.994-6.536-14.498-14.53-14.498z"></path></svg>` 


/* ==========================
   GLOBAL STATE
   ========================== */

//Stores the global authorization key



const inputUrl = document.getElementById("base-url");
const inputKey = document.getElementById("authorization-Key");



let AUTH_KEY = "";
let BASE_URL = "http://localhost:3000";


inputUrl.addEventListener("input", e => {
    BASE_URL = e.target.value;
})

inputKey.addEventListener("input", e => {
    AUTH_KEY = e.target.value;
});





/* ==========================
   DATA MODELS
   ========================== */


// Represents a query parameter definition



//Use to draw a json-like objetc in html format





class ValueType {
    static String = Symbol("String")
    static Number = Symbol("Number")
    static Array  = Symbol("Array")
    static Boolean= Symbol("Boolean")
    static Object = Symbol("Object")

    static extractValueType(v){
        if (typeof v === "string") return ValueType.String
        if (typeof v === "boolean")return ValueType.Boolean
        if (typeof v === "number") return ValueType.Number
        if (Array.isArray(v))      return ValueType.Array
        if (typeof v === "object" && v !== null) return ValueType.Object &&  Object.getPrototypeOf(v) === Object.prototype
        return null
    }

    static isPlainObject(v){
        return(
            typeof v == "object" &&
            v !== null &&
            !Array.isArray(v) &&
            Object.getPrototypeOf(v) === Object.prototype
        )
    }
}



class HTMLHelper {
    static style(el) {
        return new Proxy({}, {
            get(_, prop) {
                return value => {
                    el.style[prop] = value
                    return el
                }
            }
        })
    }
}


class ObjektraField {
    constructor({key, type, value = null, ext = []}) {
        const validTypes = Object.values(ValueType)

        if (!validTypes.includes(type)) {
            throw new TypeError("[ObjektraField] Invalid ValueType")
        }

        this.key = key
        this.type = type
        this.value = value
        this.ext = Array.isArray(ext) ? ext : []
    }

    parseIntoObject(){
        // Simple value
        if(this.type !== ValueType.Object){
            if(this.type == ValueType.Array){
                let tab = []
                for(const item of this.ext){
                    if(item instanceof ObjektraField)
                        tab.push(item.parseIntoObject())
                    else
                        tab.push(this._createPrimitiveInstance())
                }
                return { [this.key]: tab }
            }
            return { [this.key]: this._createPrimitiveInstance() }
        }

        // Object
        let source = {}
        for(const field of this.ext){
            Object.assign(source, field.parseIntoObject())
        }
        return { [this.key]: source }
    }

    _createPrimitiveInstance(){
        if(this.type === ValueType.Number)  v = Number(this.value)
        if(this.type === ValueType.String)  v = String(this.value)
        if(this.type === ValueType.Boolean) v = Boolean(this.value)
        return v
    }
}






class Objektra {
    constructor({entries, HShift = 20, textClassName = "json-object-text", mode = "simple-json-object", flexibility = 1 })
    {
        if(!Array.isArray(entries)){
            console.log("[Objektra] Bad entries");
            return;
        }
        this.entries = entries;     
        this.textClassName = textClassName;
        this.HShift = HShift;
        this.mode = mode;
        this.flexibility = flexibility

        this.canvas = document.createElement('div');
        if(mode == "simple-json-object"){
            this.buildJSONObjectView({rootElement: this.canvas, entries: this.entries});
        }
    }

    getHTMLNode()
    {
        return this.canvas;
    }

    /*=========================
        Mounting
    =========================*/

    buildJSONObjectView({ rootElement, entries, Depth = 1 })
    {
        if (!Array.isArray(entries) || entries.length === 0) return
        const [formatedEntries, isJSONArray, groupFieldOptions] = Objektra.resolveJSONLayout(entries)
        rootElement.appendChild(this._createBracket(isJSONArray, true))

        formatedEntries.forEach((entry, index) => {
            rootElement.appendChild(
                this.createRow({
                    entry,
                    index,
                    isJSONArray,
                    Depth
                })
            )
        })

        rootElement.appendChild(this._createBracket(isJSONArray, false))
    }

    //---------Helpers

    static resolveJSONLayout(entries){
        if(Array.isArray(entries[0]) && entries[0].length > 1 && ValueType.isPlainObject(entries[1]))
            return [entries[0], entries[1].array ?? false, { ...entries[1] }]
        return [entries, entries.some(e => !(e instanceof ObjektraField))]
    }



    createRow({ entry, index, isJSONArray, Depth }) {
        const row = document.createElement('div')
        row.className = "key-input-card"
        row.style.marginLeft = `${Depth * this.HShift}px`

        row.appendChild(this._createKey(entry, index, isJSONArray))

        if((entry instanceof ObjektraField && (entry.type === ValueType.Object || entry.type === ValueType.Array)))
        {
            row.appendChild(this._createSubObject(entry.ext, Depth))
        }
        else if(Array.isArray(entry))
        {
            const isParameterizedValue = this._isParametizedValue(entry)
            if(isParameterizedValue){
                console.log('is a parametize value')
                row.appendChild(this._generateInput({ entry: entry[0], isJSONArray: false,arrayFieldConfig: entry[1], inputCallback: (event)=> entry[0] = event.target.value, Depth })) //Represent data using options (object)
                return row
            }

            row.appendChild(this._createSubObject(entry, Depth))
        }
        else
        {
            row.appendChild(this._generateInput({entry, isJSONArray, Depth}))
        }
        return row
    }



    _createKey(entry, index, isJSONArray) {
        const key = document.createElement('span')
        key.className = this.textClassName
        key.textContent =  isJSONArray ? `${index ?? 'index'} : ` : `${entry.key ?? "key"}: `
        return key
    }


    _createSubObject(entry, Depth) {
        const sub = document.createElement('div')
        sub.className = "json-object-container"

        this.buildJSONObjectView({
            rootElement: sub,
            entries: entry,
            Depth: Depth + 1
        })

        return sub
    }

    _isParametizedValue(entry){
        return entry[0] && !Array.isArray(entry[0]) && !(entry[1] instanceof ObjektraField) && (ValueType.isPlainObject(entry[1]) || ValueType.extractValueType(entry[1]) === ValueType.Boolean)   // use to describe an array value fields ([simple-value/objektraField, options]). it must be a field that is not a (key, value) pair
    }


    _createBracket(isArray, isLeft) {
        const b = document.createElement('div')
        b.className = 'bracket'
        b.textContent = isArray
            ? (isLeft ? '[' : ']')
            : (isLeft ? '{' : '}')
        return b
    }


    _generateInput({entry, isJSONArray, arrayFieldConfig, inputCallback, Depth = 1})
    {
        const isField = entry instanceof ObjektraField
        const editableMode = this._resolveFlexibilityMode()

        if (!isField)
        {
            let scanner = this._computeArrayFieldValue(
                entry,
                typeof arrayFieldConfig === "undefined" 
                    ? editableMode && editableMode !== "editable-key"   //can only edit the vale here
                    : typeof arrayFieldConfig == "boolean"
                            ? arrayFieldConfig
                            : arrayFieldConfig.editable,
                inputCallback
            )
            return scanner
        }

        const container = this._materializeObjektra({ 
            entry ,
            editableMode, arrayFieldConfig, isJSONArray , inputCallback, Depth
        })
        return container
    }

    /*=====================
        Input Helpers
    =====================*/

    _resolveFlexibilityMode(){
        switch(this.flexibility){
            case 1:
                return "editable-value"
            case 2:
                return  "editable-key"
            case 3:
                return "editable"
            default:
                return ""
        }
    }

    _computeArrayFieldValue(entry, isScannable, inputCallback){
        let scanner;

        if(isScannable){
            scanner = document.createElement('input')
            scanner.placeholder = entry
            if(inputCallback)
                scanner.addEventListener('input', (event)=> inputCallback(event))
        }
        else{
            scanner = document.createElement('span')
            scanner.textContent = entry
        }
        return scanner
    }


    _materializeObjektra({ entry, editableMode, arrayFieldConfig, isJSONArray, inputCallback, Depth = 1 })
    {
        const container = document.createElement('div')
        container.className = isJSONArray
            ? "json-array-input-container"
            : "json-object-input-container"
        console.log(arrayFieldConfig ? {isJSONArray} : "")
        
        const isObjectInput = isJSONArray; 

        if (isObjectInput) {
            container.append(
                this._createBracket(true),
                this._resolveKeyRenderer({ entry, editableMode, arrayFieldConfig, Depth })
            )
        }

        container.appendChild(
            this._resolveInputRenderer({ entry, editableMode, arrayFieldConfig, inputCallback })
        )

        if (isObjectInput) {
            container.appendChild(this._createBracket(false))
        }

        return container
    }


    _resolveKeyRenderer({ entry, editableMode, arrayFieldConfig, Depth }) {
        const hasArrayConfig = arrayFieldConfig !== undefined

        const isEditable =
            hasArrayConfig
                ? (arrayFieldConfig.editableKey || arrayFieldConfig.editable)
                : (editableMode === "editable-key" || editableMode === "editable")

        if (isEditable) {
            return this._createEditableInput(
                entry.key ?? "",
                "text",
                e => entry.key = e.target.value
            )
        }

        return HTMLHelper
            .style(this._createKey(entry))
            .marginLeft(`${Depth * this.HShift}px`)
    }


    _resolveInputRenderer({ entry, editableMode, arrayFieldConfig, inputCallback }) {
        const hasArrayConfig = typeof arrayFieldConfig !== "undefined"
        const isEditable =
            hasArrayConfig
                ? (arrayFieldConfig.editable || arrayFieldConfig.editablevalue)
                : (editableMode && editableMode !== "editable-key")

        if (!isEditable) {
            return this._createReadOnlyValue(
                hasArrayConfig ? entry : entry.value
            )
        }

        return this._createEditableInput(
            this._getTypeLabel(entry),
            this._getInputType(entry),
            e => inputCallback ? inputCallback(e) : (entry.value = e.target.value)
        )
    }


    _getTypeLabel(entry) {
        return entry.type.toString().replace('Symbol(', '').replace(')', '')
    }

    _getInputType(entry) {
        if (entry.type === ValueType.Number) return 'number'
        if (entry.type === ValueType.Boolean) return 'checkbox'
        return 'text'
    }


    _createEditableInput(placeholder = "", type = "text", inputCallback) {
        const input = document.createElement('input')

        input.placeholder = placeholder

        input.type = type

        input.addEventListener('input', e => {
            if(inputCallback)
                inputCallback(e)
        })

        return input
    }

    _createReadOnlyValue(textContent) {
        const span = document.createElement('span')
        span.textContent = textContent
        return span
    }



    /*==============================
        Convertor/Parser Helper
    ================================*/
    
    //Transforme entries object into real Javascript basics object ({key: value, ....})
    static parseObjektraEntriesIntoObject(entries){
        if(!Array.isArray(entries)) return null

        const [formatedEntries, isJSONArray] = Objektra.resolveJSONLayout(entries)
        // If pure JSON object
        if(!isJSONArray){
            let obj = {}
            for(const f of formatedEntries){
                Object.assign(obj, f.parseIntoObject())
            }
            return obj
        }

        // Mixed / array
        let arr = []
        for(const item of formatedEntries){
            if(item instanceof ObjektraField){
                arr.push(item.parseIntoObject())
            }
            else {
                arr.push(item)
            }
        }
        return arr
    }


    static parseObjectIntoObjektraFields(obj) // must return an array that can either be void or full of objektra fields (only)
    {
        const entries = []
        if(Array.isArray(obj))
        {
            entries.push([], { array : true })
            for(const item of obj){
                const type = ValueType.extractValueType(item)
                if(type === ValueType.String ||type === ValueType.Number || type === ValueType.Boolean){
                    entries[0].push(item)
                }
            }
        }
    }
}






class Query {
    constructor({key, mandatory = false}) {
        this.key = key;
        this.value = null;
        this.mandatory = mandatory;
    }


    getInputHTMLNode(){
        const input = document.createElement('input');
        input.placeholder = this.key;
        input.addEventListener('input', (even) => this.value = even.target.value )
        return input;
    }
}






class Parameter {
    constructor({ key, inputEventCallback }) {
        this.key = key;
        this.value = null;
        this.inputEventCallback = inputEventCallback;
    }

    getInputHTMLNode(){
        const input = document.createElement('input');
        input.placeholder = this.key;
        input.addEventListener('input', (even) => {
            this.value = even.target.value
            if(this.inputEventCallback)
                this.inputEventCallback(this.value)
        })
        return input;
    }
}




// Represents an API endpoint definition





class Endpoint {
    constructor({ path, inputObjektraEntries = null, outputObjektraEntries = null, queries = [] })
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




// Represent a badge

class RouteBadge{
    constructor(text){
        this.text = text
        this.rootContainer = document.createElement('div')
        this.rootContainer.className = "route-badge"
        this.rootContainer.textContent = this.text
    }

    getHTMLNode(){
        return this.rootContainer
    }
}




// Represents an HTTP route (method + endpoint)




class Route {
    constructor({endpoint, method = "GET", description = "", badges = null, headers=  { "Content-Type": "application/json" }}) {
        this.method = method;
        this.endpoint = endpoint;
        this.description = description
        this.response = null;
        this.headers = headers
        this.badges = badges

        this.counter = 0;

        this.reloader = document.createElement("div")
        this.reloader.classList.add('visibility-hidden', 'svg-box')
        this.reloader.innerHTML = reloadSvg;

        this.drawer = document.createElement("div")
        this.drawer.className = "svg-box"
        this.drawer.innerHTML = drawerSvg

        this.content = null;
        this.responseContainer = null
        this.rootContainer = document.createElement("div");
    }


    paint(){
        //---base 

        const methodEl = document.createElement("div");
        methodEl.className = `method ${this.method}`;
        methodEl.textContent = this.method;

        const endpointEl = this.endpoint.getPathHTMLNode()

        //----leading

        const leadingContent = document.createElement('div')
        leadingContent.className = "route-leading"

        if(Array.isArray(this.badges) && this.badges.length > 0){
            this.badges.forEach((badge)=> leadingContent.appendChild(badge.getHTMLNode()))
        }
        leadingContent.append(this.reloader, this.drawer)


        //-----Entry

        const routeEntry = document.createElement('div')
        routeEntry.className = "route";
        routeEntry.append(methodEl, endpointEl, leadingContent)
        
        this.rootContainer.appendChild(routeEntry);
        // console.log("Route", this.endpoint.inputObjektraEntries ,this.endpoint.outputObjektraEntries, this.endpoint.queries.length, this.endpoint.params)

        if(
            this.endpoint.inputObjektraEntries 
            || this.endpoint.outputObjektraEntries
            || this.endpoint.queries.length  > 0
            || this.endpoint.params.length > 0
        ){
            const rootHandler = this.drawRootContentHandler()
            routeEntry.addEventListener('click', ()=>{
                if(this.content){
                    this.toggleContentVisibility()
                }
            })
            rootHandler.appendChild(this.getResponseSectionHTMLNode())
            this.rootContainer.appendChild(rootHandler);
        }
        else{
            this.content = this.getResponseSectionHTMLNode()
            this.rootContainer.appendChild(this.content);
        }
    }

    //---Handlers
    drawRootContentHandler(){
        this.content = document.createElement('div');
        this.content.classList.add( "display-none", "visibility-hidden");

        // Parameters
        if (this.endpoint.params.length > 0) {
            this.content.appendChild(this.getParamatersSectionHTMLNode())
        }

        // Queries
        if (this.endpoint.queries.length > 0) {
            this.content.appendChild(this.getQuerySectionHTMLNode())
        }

        // Input object
        if(this.endpoint.inputObjektraEntries){
            const inputObjektra = new Objektra({entries: this.endpoint.inputObjektraEntries});
            const inputSection = document.createElement('div');
            inputSection.className = 'input-schema-container';
            inputSection.append(this.getHeaderContentTypeHTMLNode(), inputObjektra.getHTMLNode());
            this.content.appendChild(inputSection);
        }

        // Output object
        if(this.endpoint.outputObjektraEntries){
            const outputObjektra = new Objektra({entries: this.endpoint.outputObjektraEntries});
            const outputSection = document.createElement('div');
            outputSection.className = 'output-schema-container';
            outputSection.appendChild(outputObjektra.getHTMLNode());
            this.content.appendChild(outputSection);
        }

        this.content.appendChild(this.getCallerBtnSectionHTMLNode());
        return this.content;
    }



    toggleContentVisibility(){
        this.content.classList.toggle('display-none')
        this.content.classList.toggle('route-content')
        this.content.classList.toggle('visibility-hidden')
    }


    //HTML helpers

    //HTMLResponseNode    (the section in the content used to draw the response)
    getResponseSectionHTMLNode(){
        const wrapper = document.createElement('div')
        wrapper.className = "route-response-container"

        const responseHeaderSection = document.createElement('div')
        responseHeaderSection.className = 'response-header-section'
        
        const title = document.createElement('span')
        title.className = 'response-title'

        const status = document.createElement('div')
        status.className = 'response-status'
        
        const bodyContainer = document.createElement('div')
        bodyContainer.className = "response-body-container"
        
        responseHeaderSection.append(title, status, bodyContainer)
        wrapper.appendChild(responseHeaderSection)
        this.responseContainer = wrapper

        return this.responseContainer
    }
    
    getHeaderContentTypeHTMLNode(){
        // Content-Type option
        const httpContentTypeOption  = document.createElement('select')
        httpContentTypeOption.className = "header-options"
        if(this.headers['Content-Type'] == "application/json"){
            const httpJsonContentOption  = document.createElement('option')
            httpJsonContentOption.selected = true
            httpJsonContentOption.textContent = "JSON"
            httpContentTypeOption.append(httpJsonContentOption)
        }
        else{}
        return httpContentTypeOption
    }


    getParamatersSectionHTMLNode(){
        const paramsSection = document.createElement('div')
        paramsSection.className = 'params-section'

        const title = document.createElement('div')
        title.className = 'title'
        title.textContent = "Parameters"

        const inputsRow = document.createElement('div')
        inputsRow.className = 'inputs-row'

        this.endpoint.params.forEach(param => {
            inputsRow.appendChild(param.getInputHTMLNode())
        })

        paramsSection.append(title, inputsRow)
        return paramsSection
    }
    

    getQuerySectionHTMLNode(){
        const querySection = document.createElement('div')
        querySection.className = 'query-section'

        const title = document.createElement('div')
        title.className = 'title'
        title.textContent = "Queries"

        const inputsRow = document.createElement('div')
        inputsRow.className = 'inputs-row'

        this.endpoint.queries.forEach(query => {
            inputsRow.appendChild(query.getInputHTMLNode())
        })

        querySection.append(title, inputsRow)
        return querySection;
    }

    getCallerBtnSectionHTMLNode(){
        const btnSection = document.createElement('div')
        btnSection.className = "fetcher-btn-section"

        const btn = document.createElement('button');
        btn.className = "route-btn-executer";
        btn.textContent = "Execute";
        btnSection.appendChild(btn)

        const spinner = document.createElement('div')
        spinner.className = "execution-spinner"
        btnSection.appendChild(spinner)

        btn.addEventListener('click', ()=> this.execute());
        return btnSection
    }


    // Fetch Call

    async execute(){
        try {
            const body = Objektra.parseObjektraEntriesIntoObject(this.endpoint.inputObjektraEntries);
            console.log(BASE_URL + this.endpoint.path + this.endpoint.getQueriesStringinfied())
            console.log(body)

            this.response = await fetch(
                BASE_URL + this.endpoint.path + this.endpoint.getQueriesStringinfied(),
                this.buildFetchOptions({body, headers: this.headers})
            )
            this.mountResponseViewComponents()
            this.incrementCounter()
        }
        catch (error) {
            
        }
    }

    // Builds a fetch configuration using the global auth key
     
    buildFetchOptions({ body = null, headers }) {
        return {
            method: this.method,
            headers: {...headers, "Authorization": AUTH_KEY },
            body: body ? JSON.stringify(body) : null
        };
    }

    async mountResponseViewComponents(){
        if(!this.response)
            return;
        const data = await this.response.json()
        document.querySelector('.route-response-container .response-status').textContent = `${this.response.status} ${this.response.statusText}`
        document.querySelector('.route-response-container .response-title').textContent = "Response"

        //body
        if(this.response.headers['Content-Type'] === "text/html"){
            const link = document.createElement("a")
            link.textContent = "link_toward_html_content!"
            link.addEventListener('click', ()=>{
                const html = new Blob([data], { type: 'text/html' })
                window.open(html, '_blank')
            })
            return;
        }
        const dataType = ValueType.extractValueType(data)

        if(dataType == ValueType.String || dataType == ValueType.Number){
            const span = document.createElement('span')
            span.textContent = data
            document.querySelector('.route-response-container  .response-body-container').appendChild(span)
        }
        const objektra = new Objektra({entries: Objektra.parseObjectIntoEntries(data), flexibility: 0 })
        document.querySelector('.route-response-container  .response-body-container').append(objektra.getHTMLNode())
    }


    incrementCounter(){
        this.counter++;
        if(this.counter != 0){
            this.reloader.classList.remove('visibility-hidden')
        }
    }


}




 //Represents a Resource (group of routes)

class Resource {
    constructor(name, routes) {
        this.name = name;
        this.routes = routes;
    }


    render(container) {
        const resourceEl = document.createElement("div");
        resourceEl.className = "resource";

        const title = document.createElement("h2");
        title.className = "resource-title";
        title.textContent = this.name;

        resourceEl.appendChild(title);

        this.routes.forEach(route => {
            resourceEl.appendChild(this.renderRoute(route));
        });

        container.appendChild(resourceEl);
    }

     //* Render a single route block

    renderRoute(route) {
        route.paint()
        return route.rootContainer;
    }
}




/* ==========================
   APP INITIALIZATION
   ========================== */


const container = document.getElementById("container");



// Declare API resources
 


//POST

const postResource = new Resource("Post", [
    new Route({
        endpoint: new Endpoint({ 
            path: "/posts/{accountId}/{uuid}",
        }),
        method: "GET",
        description: "This one is used to get all the post from the Api",
        badges: [new RouteBadge("PUBLIC"), new RouteBadge("Collection")]
    }),
    new Route({
        endpoint: new Endpoint({
            path: "/posts/{accountId}",
            queries: [new Query({key: "uuid", mandatory: true})],
        }),
        method: "GET",
        description: "This one is used to get one specific post from the Api"
    }),
    new Route({
        endpoint: new Endpoint({
            path: "/posts",
            inputObjektraEntries: [
                new ObjektraField({ key: 'title', type: ValueType.String }),
                new ObjektraField({ key: 'content', type: ValueType.String }),
            ],
        }),
        method: "POST"
    }),
    new Route({
        endpoint: new Endpoint({
            path: "/posts",
            inputObjektraEntries: [
                10,
                [120, false],
                [                
                    // new ObjektraField({ key: "uuid", type: ValueType.Object, ext: [new ObjektraField({ key: "accountId", type: ValueType.String }),] }),
                    [ new ObjektraField({ key: "uuid", type: ValueType.String, }), { editable: true } ],
                    [
                        new ObjektraField({ key: "accountId", type: ValueType.String }),
                        new ObjektraField({ key: "message", type: ValueType.String }),
                        new ObjektraField({ key: "celerity", type: ValueType.String })
                    ]
                ]
            ]
        }),
        method: "PATCH"
    }),
    new Route({
        endpoint: new Endpoint({
            path: "/posts/{accountId}",
            queries: [new Query({key: "uuid", mandatory: true})]
        }),
        method: "DELETE"
    }),
]);



//Account

const accountRessource = new Resource("Account", [
    new Route({
        endpoint: new Endpoint({ 
            path: "/account/{accountId}",
        }),
        method: "GET"
    }),
    new Route({
        endpoint: new Endpoint({ path: "/account" }),
        method: "DELETE"
    }),

]);





// Render all resources


postResource.render(container);
accountRessource.render(container);

