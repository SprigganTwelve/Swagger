import HTMLHelper from "./HTMLHelper.js";
import ValueType from "../ValueObject/ValueType.js";
import ObjektraRenderer from "./ObjektraRenderer.js";


class ObjektraInputHelper
{
      /*=====================
        Input Helpers
    =====================*/

    static _resolveFlexibilityMode(flexibility){
        switch(flexibility){
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



    static _computeArrayFieldValue(entry, isScannable, inputCallback){
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




    static _materializeObjektra({ entry, editableMode, arrayFieldConfig, isArrayInput, inputCallback, Depth = 1, HShift })
    {
        const container = document.createElement('div')
        container.className = isArrayInput
            ? "json-array-input-container"
            : "json-object-input-container"
        
        const isObjectInput = arrayFieldConfig ? !isArrayInput : isArrayInput; 
        console.log(isObjectInput ? {entry, arrayFieldConfig} :'')

        if (isObjectInput) {
            container.append(
                HTMLHelper.style(ObjektraRenderer._createBracket(isArrayInput, true)).marginLeft('17px'),
                this._resolveKeyRenderer({ entry, editableMode, arrayFieldConfig, Depth, HShift })
            )
        }

        container.appendChild(
            this._resolveInputRenderer({ entry, editableMode, arrayFieldConfig, inputCallback })
        )

        if (isObjectInput) {
            container.appendChild(HTMLHelper.style(ObjektraRenderer._createBracket(isArrayInput, false)).marginLeft('17px'))
        }

        return container
    }




    static _resolveKeyRenderer({ entry, editableMode, arrayFieldConfig, Depth, HShift }) {
        const hasArrayConfig = arrayFieldConfig !== undefined
        const isEditable =
            hasArrayConfig
                ? (arrayFieldConfig.editableKey || arrayFieldConfig.editable)
                : (editableMode === "editable-key" || editableMode === "editable")

        if (isEditable) {
            return HTMLHelper
                    .style(ObjektraInputHelper._createDynamicKey(entry))
                    .marginLeft(`${Depth * HShift}px`)
        }

        return HTMLHelper
            .style(ObjektraRenderer._createStaticKey(entry))
            .marginLeft(`${Depth * HShift}px`)
    }




    static _resolveInputRenderer({ entry, editableMode, arrayFieldConfig, inputCallback }) {
        const hasArrayConfig = typeof arrayFieldConfig !== "undefined"

        const isEditable =
            hasArrayConfig
                ? (arrayFieldConfig.editable || arrayFieldConfig.editableValue)
                : (editableMode && editableMode !== "editable-key")

        if (!isEditable) {
            console.log(hasArrayConfig ? { entry, edit:(arrayFieldConfig.editable || arrayFieldConfig.editableValue) }: "")
            return this._createReadOnlyValue(
                 entry.value ?? "  null"
            )
        }

        const input =  this._createEditableInput(
                            this._getTypeLabel(entry),
                            this._getInputType(entry),
                            e => inputCallback ? inputCallback(e) : (entry.value = e.target.value)
                        )
        input.style.marginLeft = "5px"
        input.style.display = 'inline-block'
        return input
    }




    static _getTypeLabel(entry) {
        return entry.type.toString().replace('Symbol(', '').replace(')', '')
    }



    static _getInputType(entry) {
        if (entry.type === ValueType.Number) return 'number'
        if (entry.type === ValueType.Boolean) return 'checkbox'
        return 'text'
    }



    static _createDynamicKey(objectField){
        const key = document.createElement('div')
        key.style.display = 'inline-block'
        key.className = "key-container"

        const input = this._createEditableInput( objectField.key ?? "", "text", e => objectField.key = e.target.value )
        const span = document.createElement('span')

        span.textContent = " : "
        key.append(input, span)
        return key
    }



    static _createEditableInput(placeholder = "", type = "text", inputCallback) {
        const input = document.createElement('input')

        input.placeholder = placeholder

        input.type = type

        input.addEventListener('input', e => {
            if(inputCallback)
                inputCallback(e)
        })
        const container = document.createElement('div')
        container.appendChild(input)
        container.style.display = 'inline-block'

        return container
    }



    static _createReadOnlyValue(textContent) {
        console.log({textContent})
        const span = document.createElement('span')
        span.textContent = textContent
        return span
    }



}

export default ObjektraInputHelper