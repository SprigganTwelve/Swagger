

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

export default Query