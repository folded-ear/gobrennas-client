import React from "react"
import PropTypes from "prop-types"
import {
    List,
    Spin,
} from "antd"
import RecipeApi from "../data/RecipeApi"

class ElEdit extends React.PureComponent {

    constructor(...args) {
        super(...args)
        this.state = {
            recog: null,
        }
    }

    componentDidMount() {
        this.recognize()
    }

    componentDidUpdate(prevProps) {
        if (this.props.value.raw === prevProps.value.raw) return
        this.recognize()
    }

    recognize() {
        const {
            name,
            value,
            onChange,
        } = this.props
        const {
            raw,
        } = value
        RecipeApi.recognizeElement(raw).then(
            recog => {
                if (recog.raw !== value.raw) return
                const raw = recog.raw
                const qr = recog.ranges.find(r => r.type === "AMOUNT")
                const ur = recog.ranges.find(
                    r => r.type === "UNIT" || r.type === "NEW_UNIT")
                const nr = recog.ranges.find(
                    r => r.type === "ITEM" || r.type === "NEW_ITEM")
                const q = qr && raw.substring(qr.start, qr.end)
                const qv = qr && qr.value
                const u = ur && raw.substring(ur.start, ur.end)
                const uv = ur && ur.value
                const n = nr && raw.substring(nr.start, nr.end)
                const nv = nr && nr.value
                const p = recog.ranges.reduce(
                    (p, r) =>
                        p.replace(raw.substring(r.start, r.end), ''),
                    raw,
                ).trim().replace(/\s+/g, ' ')
                onChange({
                    target: {
                        name,
                        value: {
                            raw: raw,
                            quantity: qv,
                            units: u, // todo: nope
                            uomId: uv,
                            item: n, // todo: nope
                            ingredientId: nv,
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
            },
            recog => this.setState({recog}))
    }

    render() {
        const {
            name,
            value,
            onChange,
        } = this.props
        const {
            raw,
            quantity,
            uomId,
            ingredientId,
            prep,
            // todo: not these...
            units,
            item,
        } = value
        const {
            recog,
            q, qv, u, uv, n, nv, p,
        } = this.state
        return <List.Item>
            <input name={`${name}.raw`} value={raw} onChange={onChange} />
            <Hunk>
                {quantity && <span style={{background: "#fde"}}>{quantity}</span>}
                {units && <span style={{background: "#efd"}}>{units} (#{uomId})</span>}
                {ingredientId && <span style={{background: "#def"}}>{item} (#{ingredientId})</span>}
                {prep && <span>, {prep}</span>}
            </Hunk>
            {recog == null
                ? <Spin />
                : <Hunk>
                    {q && <span style={{background: "#fde"}}>{q} ({qv})</span>}
                    {u && <span style={{background: "#efd"}}>{u} (#{uv})</span>}
                    {n && <span style={{background: "#def"}}>{n} (#{nv})</span>}
                    {p && <span>, {p}</span>}
                </Hunk>
            }
        </List.Item>
    }
}

const Hunk = ({children}) => <span style={{
    marginLeft: "10px",
}}>[ {children} ]</span>

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