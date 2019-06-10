import React from "react";
import PropTypes from "prop-types";
import {
    Alert,
    Spin,
} from "antd";

class LoadObjectValve extends React.PureComponent {
    render() {
        const {
            loadObject: lo,
            loadingMessage,
            errorMessage,
            renderBody,
        } = this.props;
        return ! lo.hasValue()
            ? <Spin tip={loadingMessage} />
            : lo.isLoading()
                ? <Spin tip={loadingMessage}>
                    {renderBody()}
                </Spin>
                : lo.hasError()
                    ? <Alert message={errorMessage}
                             description={lo.getErrorEnforcing()}
                             type="error"
                             showIcon />
                    : renderBody();
    }
}

LoadObjectValve.propTypes = {
    loadObject: PropTypes.any.isRequired,
    loadingMessage: PropTypes.string,
    errorMessage: PropTypes.string,
    renderBody: PropTypes.func.isRequired,
};

LoadObjectValve.defaultProps = {
    loadingMessage: "Loading...",
    errorMessage: "An error occurred. Sorry.",
};

export default LoadObjectValve;