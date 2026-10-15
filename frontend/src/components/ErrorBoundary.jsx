import { Component } from "react";
import { AlertTriangle } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error(
        "React rendering error:",
        error,
        info
      );
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="ui-error-state">
          <AlertTriangle
            size={36}
            aria-hidden="true"
          />

          <h2>Something went wrong</h2>

          <p>
            This page encountered an unexpected error.
          </p>

          <button
            type="button"
            className="retry-button"
            onClick={this.handleRetry}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;