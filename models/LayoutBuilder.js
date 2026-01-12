import GlobalSetings from "../core/global.js";
import ThemeStyle from "../ValueObject/ThemeStyle.js";

class LayoutBuilder
{
    constructor()
    {
        this.documentBody = document.querySelector('body')
        this.documentMetaData = document.querySelector("head")
        this.HTMLMainContent  = null
    }
    
    init(theme = ThemeStyle.IDE) //Initialise and stylize stylisie a container  for all your futur api ressource
    {
        if (this.documentMetaData && !this.documentMetaData.querySelector('#swagger-api-style')) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = `../styles/${theme}`
            link.id = 'swagger-api-style'
            this.documentMetaData.appendChild(link)
        }


        if(!this.HTMLMainContent){
            this.HTMLMainContent = document.createElement('div')
            this.HTMLMainContent.setAttribute('id', "container")
            this.documentBody.insertBefore(
                this.HTMLMainContent,
                this.documentBody.firstChild
            )

            return this.HTMLMainContent
        }
        return this.HTMLMainContent
    }

    renderHeaderInputs()
    {
        const header = document.createElement('header')
        header.innerHTML = `
                    <h1>API Administrator</h1>
                    <input id="base-url" placeholder="http://localhost:3000"/>
                    <input id="authorization-Key" placeholder="Authorization API Key"/>
        `

        this.documentBody.prepend(header)
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