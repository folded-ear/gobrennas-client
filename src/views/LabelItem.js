import React from 'react'
import PropTypes from 'prop-types'
import { Chip } from "@material-ui/core"

const LabelItem = ({label}) => {
    return <Chip size="small" label={label} />
}

LabelItem.propTypes = {
    label: PropTypes.string
}

export default LabelItem
