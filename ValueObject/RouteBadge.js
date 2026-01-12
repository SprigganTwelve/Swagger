
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


export default RouteBadge