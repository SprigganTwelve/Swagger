import GlobalSetings from "../core/global.js";

class LayoutBuilder
{
    constructor(){
        this.documentHTMLBody = document.querySelector('body')
        this.documentHeadData = document.querySelector("head")
        this.HTMLMainContent  = null
    }
    
    init(theme){
        if(!this.HTMLMainContent){
            this.HTMLMainContent = document.createElement('div')
            this.HTMLMainContent.setAttribute('id', "container")
            this.documentHTMLBody.insertBefore(
                this.HTMLMainContent,
                this.documentHTMLBody.firstChild
            )

            return this.HTMLMainContent
        }
    }

    renderHeaderInputs(){
        const header = document.createElement('header')
        header.innerHTML = `
                    <h1>API Administrator</h1>
                    <input id="base-url" placeholder="http://localhost:3000"/>
                    <input id="authorization-Key" placeholder="Authorization API Key"/>
        `

        this.documentHTMLBody.prepend(header)
        const inputUrl = document.getElementById("base-url");
        const inputKey = document.getElementById("authorization-Key");


        inputUrl.addEventListener("input", e => {
            GlobalSetings.BASE_URL = e.target.value;
        })

        inputKey.addEventListener("input", e => {
            GlobalSetings.AUTH_KEY = e.target.value;
        });
    }
}

export default LayoutBuilder