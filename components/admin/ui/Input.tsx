import { InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            error ? "border-red-500" : "border-gray-300"
          } ${className}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
