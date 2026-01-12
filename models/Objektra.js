
import ObjektraRenderer from "../helpers/ObjektraRenderer.js";
import ObjektraField from "../ValueObject/ObjekraField.js";
import ValueType from "../ValueObject/ValueType.js";


//Use to draw a json-like objetc in html format
class Objektra
{
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
        const [formatedEntries, isArrayInput, groupFieldOptions] = ObjektraRenderer._resolveJSONLayout(entries)
        rootElement.appendChild(ObjektraRenderer._createBracket(isArrayInput, true))

        formatedEntries.forEach((entry, index) => {
            rootElement.appendChild(
                this._createRow({
                    entry,
                    index,
                    isArrayInput,
                    Depth
                })
            )
        })

        rootElement.appendChild(ObjektraRenderer._createBracket(isArrayInput, false))
    }


    _createRow({ entry, index, isArrayInput, Depth }) {
        const row = document.createElement('div')
        row.className = "key-input-card"
        row.style.marginLeft = `${Depth * this.HShift}px`

        row.appendChild(ObjektraRenderer._createKey(entry, index, isArrayInput))

        if((entry instanceof ObjektraField && (entry.type === ValueType.Object || entry.type === ValueType.Array)))
        {
            row.appendChild(ObjektraRenderer._createSubObject(entry.ext, Depth, this.buildJSONObjectView.bind(this)))
        }
        else if(Array.isArray(entry))
        {
            const isParameterizedValue = ObjektraRenderer._isParametizedValue(entry)
            if(isParameterizedValue){
                // console.log('is a parametize value')

                row.appendChild(ObjektraRenderer._generateInput({                       //Represent data using options (object)
                    entry: entry[0],
                    flexibility: this.flexibility,
                    isArrayInput: false,
                    arrayFieldConfig: entry[1],
                    inputCallback: (event)=> entry[0] = event.target.value, Depth,
                }))

                return row
            }

            row.appendChild(ObjektraRenderer._createSubObject(entry, Depth,this.buildJSONObjectView.bind(this)))
        }
        else
        {
            row.appendChild(ObjektraRenderer._generateInput({entry, isArrayInput, Depth, flexibility: this.flexibility}))
        }
        return row
    }

    
    /*==============================
        Convertor/Parser Helper
    ================================*/
    
    //Transforme entries object into real Javascript basics object ({key: value, ....})
    static parseObjektraEntriesIntoObject(entries){
        if(!Array.isArray(entries)) return null

        const [formatedEntries, isArrayInput] = ObjektraRenderer._resolveJSONLayout(entries)
        // If pure JSON object
        if(!isArrayInput){
            let obj = {}
            for(const field of formatedEntries){
                Object.assign(obj, field.parseIntoObject())
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


export default Objektra