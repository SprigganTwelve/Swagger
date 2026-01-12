import Objektra from "../models/Objektra.js"
import ObjektraField from "../ValueObject/ObjekraField.js"
import ValueType from "../ValueObject/ValueType.js"
import ObjektraInputHelper from "./ObjektraInputHelper.js"



class ObjektraRenderer
{
    
        //---------Helpers

    static _resolveJSONLayout(entries){
        if(Array.isArray(entries[0]) && entries[0].length > 1 && ValueType.isPlainObject(entries[1]))
            return [entries[0], entries[1].array ?? false, { ...entries[1] }]
        return [entries, entries.some(e => !(e instanceof ObjektraField))]
    }



    static _createStaticKey(entry, index, isArrayInput, textClassName = "json-object-key") {
        const key = document.createElement('div')
        key.className = textClassName
        key.style.display = 'inline-block'
        key.textContent =  isArrayInput ? `${index ?? 'index'} : ` : `${entry.key ?? "key"} : `
        return key
    }




    static _createSubObject(entry, Depth, buildJSONObjectView) {
        const sub = document.createElement('div')
        sub.className = "json-object-container"

        buildJSONObjectView({
            rootElement: sub,
            entries: entry,
            Depth: Depth + 1
        })

        return sub
    }

    static _isParametizedValue(entry){    // use to describe an array value fields ([simple-value/objektraField, options]). it must be a field that is not a (key, value) pair
        return ( 
            entry[0] && !Array.isArray(entry[0]) && !(entry[1] instanceof ObjektraField) &&
            (ValueType.isPlainObject(entry[1]) || ValueType.extractValueType(entry[1]) === ValueType.Boolean)
        )
    }




    static _createBracket(isArrayInput, isLeft) {
        const b = document.createElement('div')
        b.className = 'bracket'
        b.textContent = isArrayInput
            ? (isLeft ? '[' : ']')
            : (isLeft ? '{' : '}')
        return b
    }



    
    static _generateInput({entry, isArrayInput, arrayFieldConfig, inputCallback, Depth = 1, flexibility, HShift })
    {
        const isField = entry instanceof ObjektraField
        const editableMode = ObjektraInputHelper._resolveFlexibilityMode(flexibility)

        if (!isField)
        {
            let scanner = ObjektraInputHelper._computeArrayFieldValue(
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

        const container = ObjektraInputHelper._materializeObjektra({ 
            entry , HShift,
            editableMode, arrayFieldConfig, isArrayInput , inputCallback, Depth
        })
        return container
    }

  
}

export default ObjektraRenderer