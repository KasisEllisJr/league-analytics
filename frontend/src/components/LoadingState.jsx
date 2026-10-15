import { LoaderCircle } from "lucide-react";

function LoadingState({
  message = "Loading data...",
}) {
  return (
    <div
      className="ui-loading-state"
      role="status"
      aria-live="polite"
    >
      <LoaderCircle
        className="loading-spinner"
        size={28}
        aria-hidden="true"
      />

      <p>{message}</p>
    </div>
  );
}

export default LoadingState;