import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function ExpandableCard({
  title,
  src,
  description,
  children,
  className,
  classNameExpanded,
  ...props
}) {
  const [active, setActive] = React.useState(false);
  const cardRef = React.useRef(null);
  const id = React.useId();

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setActive(false);
      }
    };

    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setActive(false);
      }
    };

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [active]);

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md h-full w-full z-[190]"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && (
          <div
            className={cn(
              "fixed inset-0 grid place-items-center z-[200] sm:py-8 before:pointer-events-none overflow-hidden",
            )}
          >
            <motion.div
              layoutId={`card-${title}-${id}`}
              ref={cardRef}
              className={cn(
                "w-full max-w-[700px] h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] sm:rounded-2xl bg-[#0D0D0D] border border-solid border-neutral-800/50 shadow-2xl relative text-[#F5F0E8]",
                classNameExpanded,
              )}
              {...props}
            >
              <motion.div layoutId={`image-${title}-${id}`} className="relative h-64 sm:h-80 shrink-0">
                <div className="absolute inset-0 before:absolute before:inset-x-0 before:bottom-[-1px] before:h-[70px] before:z-50 before:bg-gradient-to-t before:from-[#0D0D0D] before:to-transparent">
                  <img
                    src={src}
                    alt={title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </motion.div>
              <div className="relative p-6 sm:p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <motion.p
                      layoutId={`description-${description}-${id}`}
                      className="text-[#C9A96E] text-xs font-semibold uppercase tracking-widest"
                      style={{ fontFamily: 'Tenor Sans, sans-serif' }}
                    >
                      {description}
                    </motion.p>
                    <motion.h3
                      layoutId={`title-${title}-${id}`}
                      className="font-normal text-[#F5F0E8] text-3xl sm:text-4xl mt-1.5"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {title}
                    </motion.h3>
                  </div>
                  <motion.button
                    aria-label="Close card"
                    layoutId={`button-${title}-${id}`}
                    className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-[#1A1A1A] text-[#F5F0E8] border border-neutral-800 hover:border-neutral-700 transition-colors focus:outline-none"
                    onClick={() => setActive(false)}
                  >
                    <motion.div
                      animate={{ rotate: active ? 45 : 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </motion.div>
                  </motion.button>
                </div>
                <div className="relative overflow-auto max-h-[40vh] [scrollbar-width:none] [-ms-overflow-style:none]">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[#F5F0E8]/70 text-sm pb-4 flex flex-col items-start gap-4"
                    style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, lineHeight: 1.7 }}
                  >
                    {children}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        role="dialog"
        aria-labelledby={`card-title-${id}`}
        aria-modal="true"
        layoutId={`card-${title}-${id}`}
        onClick={() => setActive(true)}
        className={cn(
          "p-4 flex flex-col justify-between items-stretch bg-[#111111] hover:bg-[#151515] shadow-lg rounded-2xl cursor-pointer border border-neutral-800/40 hover:border-neutral-700/60 transition-all duration-300 w-full group",
          className,
        )}
      >
        <div className="flex gap-4 flex-col w-full">
          <motion.div layoutId={`image-${title}-${id}`} className="overflow-hidden rounded-lg relative">
            <img
              src={src}
              alt={title}
              className="w-full h-56 object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/0 transition-colors duration-500" />
          </motion.div>
          <div className="flex justify-between items-center px-1">
            <div className="flex flex-col">
              <motion.p
                layoutId={`description-${description}-${id}`}
                className="text-[#C9A96E] text-left text-[9px] font-semibold uppercase tracking-widest"
                style={{ fontFamily: 'Tenor Sans, sans-serif' }}
              >
                {description}
              </motion.p>
              <motion.h3
                layoutId={`title-${title}-${id}`}
                className="text-[#F5F0E8] text-left font-normal text-lg sm:text-xl mt-1"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                {title}
              </motion.h3>
            </div>
            <motion.button
              aria-label="Open card"
              layoutId={`button-${title}-${id}`}
              className={cn(
                "h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-[#1A1A1A] border border-neutral-800 hover:border-neutral-700 text-[#F5F0E8] transition-colors focus:outline-none",
              )}
            >
              <motion.div
                animate={{ rotate: active ? 45 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
