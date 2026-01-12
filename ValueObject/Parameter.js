

// Represents a query parameter definition
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



export default Parameter