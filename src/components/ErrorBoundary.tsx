import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in CarbonIQ application:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-screen bg-[#07080b] text-[#f1f5f9] font-sans flex flex-col justify-center items-center p-6 selection:bg-[#22C55E]/30" id="carboniq-error-boundary-screen">
          <div className="max-w-md w-full bg-[#11131a] border border-[#1e2230] rounded-2xl p-8 space-y-6 shadow-2xl text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-xl font-bold font-mono">
              !
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-sans font-black tracking-tight text-white uppercase">Application Fault Isolated</h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                CarbonIQ intercepted an unexpected UI rendering fault. The system isolated the node state to prevent session degradation.
              </p>
            </div>
            {this.state.error && (
              <div className="bg-[#0c0d12] p-3 rounded-lg border border-zinc-850 text-left font-mono text-[10px] text-red-400 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-[#3b82f6] hover:bg-[#1d63d8] text-white font-extrabold py-2.5 rounded-lg transition-all text-xs uppercase tracking-wider"
            >
              Reinitialize Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
