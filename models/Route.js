import Objektra from "./Objektra.js";
import { drawerSvg, reloadSvg } from "../svg/index.js";
 


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
            const inputObjektra = new Objektra({entries: this.endpoint.inputObjektraEntries, flexibility: 1});
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


export default Route