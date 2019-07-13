const capitalize = str => {
    if (str == null) return null
    if (str.length === 0) return str
    if (str.length === 1) return str.toUpperCase()
    return str.charAt(0).toUpperCase() + str.substring(1)
}

export default capitalize