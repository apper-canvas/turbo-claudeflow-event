import { useState } from 'react';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

function Home() {
  const [activeTab, setActiveTab] = useState('convert');
  
  const GithubIcon = getIcon('Github');
  const CodeIcon = getIcon('Code');
  const FileTextIcon = getIcon('FileText');
  const ArrowRightIcon = getIcon('ArrowRight');
  
  
  
  return (
    <div className="flex flex-col space-y-8">
      <section className="text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gradient">
            Transform Claude's Output
          </h1>
          <p className="text-lg md:text-xl text-surface-600 dark:text-surface-300 mb-6">
            Convert Claude AI's streamed response format into clean, readable text in seconds
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <a 
              href="#converter" 
              className="btn btn-primary gap-2 group"
            >
              <span>Start Converting</span>
              <ArrowRightIcon className="inline w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="https://github.com/yourusername/claudeflow" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline gap-2"
            >
              <GithubIcon className="w-5 h-5" />
              <span>View on GitHub</span>
            </a>
          </div>
        </motion.div>
        
        <div className="flex justify-center mb-4">
          <div className="inline-flex p-1 bg-surface-100 dark:bg-surface-700 rounded-lg shadow-inner">
            <button
              onClick={() => setActiveTab('convert')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                activeTab === 'convert'
                  ? 'bg-white dark:bg-surface-800 text-primary shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileTextIcon size={16} className="w-4 h-4" />
                <span>Text Converter</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-surface-800 text-primary shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <CodeIcon size={16} className="w-4 h-4" />
                <span>About</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section id="converter" className="w-full max-w-5xl mx-auto">
        {activeTab === 'convert' ? (
          <MainFeature />
        ) : (
          <div className="card p-8">
            <h2 className="text-2xl font-bold mb-4">About ClaudeFlow</h2>
            <p className="mb-4">
              Claude AI's streamed responses often come with formatting artifacts like timestamps and 
              progress indicators. ClaudeFlow helps you convert that text into clean, readable content.
            </p>
            <h3 className="text-xl font-semibold mb-2">How It Works</h3>
            <ol className="list-decimal pl-5 mb-4 space-y-2">
              <li>Paste text from Claude's streamed output or upload a text file</li>
              <li>Click the "Convert" button to process the text</li>
              <li>View the clean, formatted output</li>
              <li>Copy to clipboard or download as needed</li>
            </ol>
            <p className="text-surface-600 dark:text-surface-400 italic">
              ClaudeFlow handles common streaming artifacts like timestamps, progress bars, and other 
              formatting issues that appear in Claude's streamed responses.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;