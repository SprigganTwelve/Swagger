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




    static _materializeObjektra({ entry, editableMode, arrayFieldConfig, isArrayInput, inputCallback, Depth = 1 })
    {
        const container = document.createElement('div')
        container.className = isArrayInput
            ? "json-array-input-container"
            : "json-object-input-container"
        
        const isObjectInput = arrayFieldConfig ? !isArrayInput : isArrayInput; 
        console.log(isObjectInput ? {entry, arrayFieldConfig} :'')

        if (isObjectInput) {
            container.append(
                ObjektraRenderer._createBracket(isArrayInput, true),
                this._resolveKeyRenderer({ entry, editableMode, arrayFieldConfig, Depth })
            )
        }

        container.appendChild(
            this._resolveInputRenderer({ entry, editableMode, arrayFieldConfig, inputCallback })
        )

        if (isObjectInput) {
            container.appendChild(ObjektraRenderer._createBracket(isArrayInput, false))
        }

        return container
    }




    static _resolveKeyRenderer({ entry, editableMode, arrayFieldConfig, Depth }) {
        const hasArrayConfig = arrayFieldConfig !== undefined
        const isEditable =
            hasArrayConfig
                ? (arrayFieldConfig.editableKey || arrayFieldConfig.editable)
                : (editableMode === "editable-key" || editableMode === "editable")

        if (isEditable) {
            const key = document.createElement('div')
            key.className = "key-container"

            const input = this._createEditableInput( entry.key ?? "", "text", e => entry.key = e.target.value )
            const span = document.createElement('span')

            span.textContent = " : "
            key.append(input, span)
            return key
        }

        return HTMLHelper
            .style(ObjektraRenderer._createKey(entry))
            .marginLeft(`${Depth * this.HShift}px`)
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
                 entry.value ?? "null"
            )
        }

        return this._createEditableInput(
            this._getTypeLabel(entry),
            this._getInputType(entry),
            e => inputCallback ? inputCallback(e) : (entry.value = e.target.value)
        )
    }




    static _getTypeLabel(entry) {
        return entry.type.toString().replace('Symbol(', '').replace(')', '')
    }



    static _getInputType(entry) {
        if (entry.type === ValueType.Number) return 'number'
        if (entry.type === ValueType.Boolean) return 'checkbox'
        return 'text'
    }




    static _createEditableInput(placeholder = "", type = "text", inputCallback) {
        const input = document.createElement('input')

        input.placeholder = placeholder

        input.type = type

        input.addEventListener('input', e => {
            if(inputCallback)
                inputCallback(e)
        })

        return input
    }



    static _createReadOnlyValue(textContent) {
        console.log({textContent})
        const span = document.createElement('span')
        span.textContent = textContent
        return span
    }



}

export default ObjektraInputHelper