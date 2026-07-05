import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -10,
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3
};

const PageWrapper = ({ children, title, className = '' }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={`w-full ${className}`}
    >
      {title && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default PageWrapper;
