interface ProgressStepsProps {
  currentStep: number;
  steps: string[];
}

export function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300
                  ${i < currentStep
                    ? "bg-primary text-white"
                    : i === currentStep
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "bg-border/50 text-muted"
                  }`}
              >
                {i < currentStep ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`hidden text-sm sm:block ${
                  i <= currentStep ? "font-medium text-foreground" : "text-muted"
                }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-8 sm:w-12 transition-colors duration-300 ${
                  i < currentStep ? "bg-primary" : "bg-border/50"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
