// components/ReflectionModal.js
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: { y: "-30px", opacity: 0, scale: 0.95 },
  visible: { y: "0", opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { y: "30px", opacity: 0, scale: 0.90, transition: { duration: 0.2 } },
};

const ReflectionModal = ({ isOpen, insight, onClose, onSave }) => {
  const [reflection, setReflection] = useState('');
  const textareaRef = useRef(null); // For auto-focus

  // Reset reflection text when modal opens for a new insight or reopens
  useEffect(() => {
    if (isOpen) {
      setReflection(''); // Clear previous text
      // Auto-focus textarea when modal becomes visible
      // Timeout helps ensure the element is in the DOM and focusable
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100); 
    }
  }, [isOpen, insight]); // Rerun if isOpen or insight changes

  const handleSave = () => {
    onSave(insight.id, reflection);
    // setReflection(''); // Already cleared on open by useEffect
    onClose();
  };

  const handleClose = () => {
    // setReflection(''); // Already cleared on open by useEffect
    onClose();
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function to restore scroll on component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);


  return (
    <AnimatePresence>
      {isOpen && insight && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50" // Added sm:p-4 for slightly more padding on larger small screens
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleClose} 
        >
          <motion.div
            className="
              bg-white rounded-lg shadow-xl 
              w-full max-w-md 
              flex flex-col 
              max-h-[90vh] sm:max-h-[85vh] /* Max height to prevent overflow on small screens */
            "
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Modal Header */}
            <div className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-4 border-b border-slate-200">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Reflect on this Insight:</h2>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 flex-grow overflow-y-auto"> 
              <p className="text-sm sm:text-base text-slate-600 italic mb-3 sm:mb-4">
                "{insight.text}"
              </p>
              <textarea
                ref={textareaRef}
                className="
                  w-full h-32 sm:h-36 /* Slightly taller textarea */
                  p-2 sm:p-3 border border-slate-300 rounded-md 
                  focus:ring-2 focus:ring-sky-500 focus:border-sky-500 
                  resize-none font-sans text-sm sm:text-base
                "
                placeholder="Your thoughts, connections, or actions..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              />
            </div>
            
            {/* Modal Footer */}
            <div className="
              px-4 py-3 sm:px-6 sm:py-4 
              bg-slate-50 rounded-b-lg /* Subtle background for footer */
              flex flex-col-reverse sm:flex-row sm:justify-end 
              space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3
            "> {/* Buttons stack on mobile, row on sm+ */}
              <button
                type="button" // Good practice for buttons not submitting forms
                onClick={handleClose}
                className="
                  w-full sm:w-auto px-4 py-2.5 
                  text-sm font-medium text-slate-700 
                  bg-white hover:bg-slate-100 
                  border border-slate-300 rounded-md shadow-sm 
                  transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
                "
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!reflection.trim()} // Disable save if reflection is empty
                className="
                  w-full sm:w-auto px-4 py-2.5 
                  text-sm font-medium text-white 
                  bg-sky-600 hover:bg-sky-700 
                  rounded-md shadow-sm 
                  transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
                  disabled:bg-slate-300 disabled:cursor-not-allowed
                "
              >
                Save Reflection
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReflectionModal;