import React, { Component } from "react";

class ErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught in ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h2>Something went wrong while rendering the chart.</h2>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
