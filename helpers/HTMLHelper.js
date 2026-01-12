
class HTMLHelper {
    static style(el) {  //ease the setting rule of HTMLStyle element
        return new Proxy({}, {
            get(_, prop) {
                return value => {
                    el.style[prop] = value
                    return el
                }
            }
        })
    }
}


export default HTMLHelper