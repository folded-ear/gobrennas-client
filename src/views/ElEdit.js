import React from "react"
import PropTypes from "prop-types"
import {
    AutoComplete,
    Icon,
    Input,
    Select,
    Spin,
} from "antd"
import RecipeApi from "../data/RecipeApi"
import debounce from "../util/debounce"

const doRecog = raw =>
    raw != null && raw.trim().length >= 3

class ElEdit extends React.PureComponent {

    constructor(...args) {
        super(...args)
        this.state = {
            recog: null,
        }
        this.recognizeDebounced = debounce(this.recognize.bind(this))
        this.handleChange = this.handleChange.bind(this)
        this.onPaste = this.onPaste.bind(this)
    }

    componentDidMount() {
        this.recognize()
    }

    componentDidUpdate(prevProps) {
        if (this.props.value.raw === prevProps.value.raw) return
        this.recognizeDebounced()
    }

    recognize() {
        const {
            name,
            value,
            onChange,
        } = this.props
        if (!doRecog(value.raw)) return
        // todo: get the actual cursor position
        RecipeApi.recognizeElement(value.raw, value.raw.length)
            .then(recog => {
                if (recog.raw !== this.props.value.raw) return
                const qr = recog.ranges.find(r =>
                    r.type === "AMOUNT")
                const ur = recog.ranges.find(r =>
                    r.type === "UNIT" || r.type === "NEW_UNIT")
                const nr = recog.ranges.find(r =>
                    r.type === "ITEM" || r.type === "NEW_ITEM")
                const textFromRange = r =>
                    r && recog.raw.substring(r.start, r.end)
                const stripMarkers = s => {
                    if (s == null) return s
                    if (s.length < 3) return s
                    const c = s.charAt(0).toLowerCase()
                    if (c !== s.charAt(s.length - 1)) return s
                    if (c >= 'a' && c <= 'z') return s
                    if (c >= '0' && c <= '9') return s
                    return s.substring(1, s.length - 1)
                }
                const q = textFromRange(qr)
                const qv = qr && qr.value
                const u = textFromRange(ur)
                const uv = ur && ur.value
                const n = textFromRange(nr)
                const nv = nr && nr.value
                const p = [qr, ur, nr]
                    .filter(it => it != null)
                    .sort((a, b) => b.start - a.start)
                    .reduce(
                        (p, r) =>
                            p.substr(0, r.start) + p.substr(r.end),
                        recog.raw,
                    )
                    .trim()
                    .replace(/\s+/g, ' ')
                    .replace(/^\s*,/, '')
                onChange({
                    target: {
                        name,
                        value: {
                            raw: recog.raw,
                            quantity: qv,
                            uomId: uv,
                            units: stripMarkers(u),
                            ingredientId: nv,
                            ingredient: stripMarkers(n),
                            preparation: p,
                        },
                    },
                })
                const suggestions = recog.suggestions.map(s => {
                    const prefix = recog.raw.substr(0, s.target.start)
                    const suffix = recog.raw.substr(s.target.end)
                    const quote = s.name.indexOf(' ') >= 0 ||
                        recog.raw.charAt(s.target.start) === '"' ||
                        recog.raw.charAt(s.target.end - 1) === '"'
                    const value = quote
                        ? `"${s.name}"`
                        : s.name
                    return {
                        prefix,
                        value,
                        suffix,
                        result: prefix + value + suffix,
                    }
                })
                return this.setState({
                    recog,
                    q, qv,
                    u, uv,
                    n, nv,
                    p,
                    suggestions,
                })
            })
    }

    handleChange(v) {
        const {
            name,
            onChange,
        } = this.props
        // suggestions are always made stale by change
        this.setState({suggestions: null})
        onChange({
            target: {
                name,
                value: {
                    raw: v,
                },
            },
        })
    }

    onPaste(e) {
        const {
            onMultilinePaste,
        } = this.props
        if (onMultilinePaste == null) return // don't care!
        let text = e.clipboardData.getData("text")
        if (text == null) return
        text = text.trim()
        if (text.indexOf("\n") < 0) return // default behaviour
        e.preventDefault() // no default
        onMultilinePaste(text)
    }

    render() {
        const {
            name,
            value,
        } = this.props
        const {
            raw,
        } = value
        const {
            recog,
            q, u, uv, n, nv, p,
            suggestions,
        } = this.state
        return <React.Fragment>
            <AutoComplete name={`${name}.raw`}
                          value={raw}
                          onChange={this.handleChange}
                          dataSource={suggestions && suggestions.map(
                              s => <Select.Option key={s.result}
                                                  value={s.result}
                              >
                                  <span style={{color: "#999"}}>{s.prefix}</span>
                                  <strong>{s.value}</strong>
                                  <span style={{color: "#999"}}>{s.suffix}</span>
                              </Select.Option>)}
                          style={{
                              width: "50%",
                          }}
            >
                <Input onPaste={this.onPaste}
                       autoComplete={"off"}
                       suffix={n == null
                           ? <Icon type="warning"
                                   title="No Ingredient Found!"
                                   style={{
                                       color: "red",
                                   }}
                           />
                           : <span />} />
            </AutoComplete>
            {recog == null
                ? doRecog(raw) ? <Hunk><Spin /></Hunk> : null
                : <Hunk>
                    {q && <Hunk style={{backgroundColor: "#fde"}}>{q}</Hunk>}
                    {u && <Hunk style={{backgroundColor: uv ? "#efd" : "#dfe"}}>{u}</Hunk>}
                    {n && <Hunk style={{backgroundColor: nv ? "#def" : "#edf"}}>{n}</Hunk>}
                    {p && <span>{n ? ", " : null}{p}</span>}
                </Hunk>
            }
        </React.Fragment>
    }
}

const Hunk = ({children, style}) => <span style={{
    ...style,
    marginLeft: "0.4em",
    padding: "0 0.25em"
}}>{children}</span>

ElEdit.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.shape({
        raw: PropTypes.string.isRequired,
        quantity: PropTypes.number,
        units: PropTypes.string,
        ingredientId: PropTypes.number,
        preparation: PropTypes.string,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onMultilinePaste: PropTypes.func,
}

export default ElEdit