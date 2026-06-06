import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumbs() {
  const location = useLocation();
  const path = location.pathname;

  // Define steps of the booking funnel
  const steps = [
    { label: 'Ritual Select', path: '/booking', id: 'booking' },
    { label: 'Payment Details', path: '/checkout', id: 'checkout' },
    { label: 'Confirmation', path: '/confirmed', id: 'confirmed' },
  ];

  // Helper to determine step status
  const getStepStatus = (stepIndex) => {
    const currentStepIndex = steps.findIndex((s) => s.path === path);
    if (currentStepIndex === -1) return 'inactive';
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'inactive';
  };

  return (
    <nav className="w-full flex justify-center py-md px-lg" aria-label="Booking progress">
      <ol className="flex items-center gap-xs sm:gap-md max-w-lg w-full">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isCompleted = status === 'completed';
          const isActive = status === 'active';

          return (
            <React.Fragment key={step.id}>
              {/* Step indicator */}
              <li className="flex items-center gap-xs select-none">
                {isCompleted ? (
                  <Link
                    to={step.path}
                    className="flex items-center gap-xs font-label-caps text-[10px] tracking-wider text-primary dark:text-gold hover:opacity-80 transition-opacity"
                  >
                    <span className="w-4 h-4 rounded-full bg-primary dark:bg-gold text-white dark:text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </Link>
                ) : isActive ? (
                  <span className="flex items-center gap-xs font-label-caps text-[10px] tracking-wider text-primary dark:text-gold font-bold">
                    <span className="w-4 h-4 rounded-full border border-primary dark:border-gold flex items-center justify-center text-[9px] font-bold animate-pulse">
                      {index + 1}
                    </span>
                    <span>{step.label}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-xs font-label-caps text-[10px] tracking-wider text-on-surface-variant/40 dark:text-zinc-600">
                    <span className="w-4 h-4 rounded-full border border-on-surface-variant/20 dark:border-zinc-700 flex items-center justify-center text-[9px]">
                      {index + 1}
                    </span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </span>
                )}
              </li>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-[1px] min-w-[20px] transition-colors duration-500
                    ${getStepStatus(index + 1) !== 'inactive' 
                      ? 'bg-primary dark:bg-gold' 
                      : 'bg-outline-variant/30 dark:bg-zinc-800'
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
