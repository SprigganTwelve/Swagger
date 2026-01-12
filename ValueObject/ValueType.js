

class ValueType {
    static String = Symbol("String")
    static Number = Symbol("Number")
    static Array  = Symbol("Array")
    static Boolean= Symbol("Boolean")
    static Object = Symbol("Object")

    static extractValueType(v){
        if (typeof v === "string") return ValueType.String
        if (typeof v === "boolean")return ValueType.Boolean
        if (typeof v === "number") return ValueType.Number
        if (Array.isArray(v))      return ValueType.Array
        if (typeof v === "object" && v !== null) return ValueType.Object &&  Object.getPrototypeOf(v) === Object.prototype
        return null
    }

    static isPlainObject(v){
        return(
            typeof v == "object" &&
            v !== null &&
            !Array.isArray(v) &&
            Object.getPrototypeOf(v) === Object.prototype
        )
    }

    static isNonEmptyObject(v){
        return ValueType.isPlainObject(v) && Object.keys(v).length > 0
    }
}


export default ValueType