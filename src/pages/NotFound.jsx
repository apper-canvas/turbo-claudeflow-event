import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

function NotFound() {
  const ArrowLeftIcon = getIcon('ArrowLeft');
  const FileSearchIcon = getIcon('FileSearch');

  return (
    <motion.div 
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        className="mb-8 text-primary-light"
      >
        <FileSearchIcon size={120} strokeWidth={1.5} />
      </motion.div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">404 - Page Not Found</h1>
      
      <p className="text-xl text-surface-600 dark:text-surface-300 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link 
          to="/" 
          className="btn btn-primary py-3 px-6 flex items-center gap-2 text-lg"
        >
          <ArrowLeftIcon size={20} />
          <span>Back to Home</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default NotFound;