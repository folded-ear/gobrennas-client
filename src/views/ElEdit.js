import React from "react"
import PropTypes from "prop-types"
import {
    Icon,
    Input,
    Spin,
} from "antd"
import RecipeApi from "../data/RecipeApi"
import debounce from "../util/debounce"

class ElEdit extends React.PureComponent {

    constructor(...args) {
        super(...args)
        this.state = {
            recog: null,
        }
        this.recognizeDebounced = debounce(this.recognize.bind(this))
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
        if (value.raw == null || value.raw.trim().length === 0) return
        RecipeApi.recognizeElement(value.raw)
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
                const p = recog.ranges.reduce(
                    (p, r) =>
                        p.replace(recog.raw.substring(r.start, r.end), ''),
                    recog.raw,
                ).trim().replace(/\s+/g, ' ')
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
                            prep: p,
                        },
                    },
                })
                return this.setState({
                    recog,
                    q, qv,
                    u, uv,
                    n, nv,
                    p,
                })
            })
    }

    render() {
        const {
            name,
            value,
            onChange,
        } = this.props
        const {
            raw,
        } = value
        const {
            recog,
            q, u, uv, n, nv, p,
        } = this.state
        return <React.Fragment>
            <Input name={`${name}.raw`}
                   value={raw}
                   onChange={onChange}
                   style={{
                       width: "50%",
                   }}
                   suffix={n == null
                       ? <Icon type="warning"
                               title="No Ingredient Found!"
                               style={{
                                   color: "red",
                               }}
                       />
                       : <span />}
            />
            {recog == null
                ? <Hunk><Spin /></Hunk>
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
        prep: PropTypes.string,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
}

export default ElEdit