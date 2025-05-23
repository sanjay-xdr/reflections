// components/ReflectionModal.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: { y: "-50px", opacity: 0, scale: 0.95 },
  visible: { y: "0", opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { y: "30px", opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const ReflectionModal = ({ isOpen, insight, onClose, onSave }) => {
  const [reflection, setReflection] = useState('');

  const handleSave = () => {
    onSave(insight.id, reflection);
    setReflection(''); // Clear for next time
    onClose();
  };

  const handleClose = () => {
    setReflection('');
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && insight && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleClose} // Close on backdrop click
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()} // Prevent close on modal content click
          >
            <h2 className="text-xl font-semibold mb-2 text-slate-800">Reflect on this Insight:</h2>
            <p className="text-sm text-slate-600 italic mb-4">"{insight.text}"</p>
            <textarea
              className="w-full h-32 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-sans"
              placeholder="Your thoughts, connections, or actions..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              autoFocus
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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