import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "@repo/ui";
import { AlertTriangle, ChevronDown, ChevronUp, Home, RefreshCw } from "lucide-react";
import { useState } from "react";

export function ErrorBoundary() {
  const error = useRouteError();
  const [showDetails, setShowDetails] = useState(false);

  let errorMessage: string;
  let errorTitle: string;

  if (isRouteErrorResponse(error)) {
    // specialized error messages for specific status codes
    if (error.status === 404) {
      errorTitle = "Page Not Found";
      errorMessage = "Sorry, we couldn't find the page you were looking for.";
    } else if (error.status === 401) {
      errorTitle = "Unauthorized";
      errorMessage = "You aren't authorized to see this page.";
    } else if (error.status === 503) {
      errorTitle = "Service Unavailable";
      errorMessage = "Our API is temporarily down. Please try again later.";
    } else {
      errorTitle = "Something went wrong";
      errorMessage = error.statusText || "An unexpected error occurred.";
    }
  } else if (error instanceof Error) {
    errorTitle = "Application Error";
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorTitle = "Error";
    errorMessage = error;
  } else {
    errorTitle = "Unknown Error";
    errorMessage = "An unknown error has occurred.";
  }

  const errorDetails = isRouteErrorResponse(error)
    ? JSON.stringify(error, null, 2)
    : error instanceof Error
      ? error.stack
      : String(error);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground animate-in fade-in duration-500">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="mx-auto h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{errorTitle}</h1>
          <p className="text-lg text-muted-foreground">{errorMessage}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button onClick={() => window.location.reload()} size="lg" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="pt-8 border-t mt-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-muted-foreground hover:text-foreground gap-2 w-full flex items-center justify-center"
          >
            {showDetails ? (
              <>
                Hide Technical Details <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show Technical Details <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>

          {showDetails && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left overflow-auto max-h-[300px] border text-xs font-mono">
              <pre className="whitespace-pre-wrap break-words text-destructive">
                {errorDetails}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
