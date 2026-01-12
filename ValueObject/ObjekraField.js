import ValueType from "./ValueType.js"


class ObjektraField {
    constructor({key, type, value = null, ext = []}) {
        const validTypes = Object.values(ValueType)

        if (!validTypes.includes(type)) {
            throw new TypeError("[ObjektraField] Invalid ValueType")
        }

        this.key = key
        this.type = type
        this.value = value
        this.ext = Array.isArray(ext) ? ext : []
    }

    parseIntoObject(){
        // Simple value
        if(this.type !== ValueType.Object){
            if(this.type == ValueType.Array){
                let tab = []
                for(const item of this.ext){
                    if(item instanceof ObjektraField)
                        tab.push(item.parseIntoObject())
                    else
                        tab.push(this._createPrimitiveInstance())
                }
                return { [this.key]: tab }
            }
            return { [this.key]: this._createPrimitiveInstance() }
        }

        // Object
        let source = {}
        for(const field of this.ext){
            Object.assign(source, field.parseIntoObject())
        }
        return { [this.key]: source }
    }

    _createPrimitiveInstance(){
        if(this.type === ValueType.Number)  v = Number(this.value)
        if(this.type === ValueType.String)  v = String(this.value)
        if(this.type === ValueType.Boolean) v = Boolean(this.value)
        return v
    }
}

export default ObjektraField