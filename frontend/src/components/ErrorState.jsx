import { AlertCircle, RefreshCw } from "lucide-react";

function ErrorState({
  message = "Something went wrong.",
  onRetry,
}) {
  return (
    <div className="ui-error-state" role="alert">
      <AlertCircle
        size={30}
        aria-hidden="true"
      />

      <h2>Unable to load data</h2>

      <p>{message}</p>

      {typeof onRetry === "function" && (
        <button
          type="button"
          className="retry-button"
          onClick={onRetry}
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;