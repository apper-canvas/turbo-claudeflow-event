import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';

function MainFeature() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [settings, setSettings] = useState({
    removeTimestamps: true,
    removeProgressBars: true,
    preserveParagraphs: true,
    mergeLines: false
  });
  
  const fileInputRef = useRef(null);
  const outputRef = useRef(null);
  
  // Declare all icons upfront
  const FileUpIcon = getIcon('FileUp');
  const ClipboardIcon = getIcon('Clipboard');
  const RefreshCcwIcon = getIcon('RefreshCcw');
  const DownloadIcon = getIcon('Download');
  const TrashIcon = getIcon('Trash');
  const WandIcon = getIcon('Wand2');
  const InfoIcon = getIcon('Info');
  const LoaderIcon = getIcon('Loader2');
  const ClipboardCheckIcon = getIcon('ClipboardCheck');
  const SettingsIcon = getIcon('Settings');
  const CheckIcon = getIcon('Check');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };
  
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileUpload = (file) => {
    if (file.type !== 'text/plain') {
      toast.error('Please upload a .txt file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setInputText(e.target.result);
      toast.success(`Loaded ${file.name}`);
    };
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    reader.readAsText(file);
  };

  const handleCopyToClipboard = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText)
        .then(() => toast.success('Copied to clipboard!'))
        .catch(err => toast.error('Failed to copy text'));
    }
  };
  
  const handleDownload = () => {
    if (outputText) {
      const blob = new Blob([outputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'claude-converted-text.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.info('Text downloaded as file');
    }
  };
  
  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setHasOutput(false);
    toast.info('Input and output cleared');
  };
  
  const toggleSetting = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const processClaudeStream = (text) => {
    // Return original text if it doesn't look like a Claude stream
    if (!text.includes('data: {')) {
      return text;
    }

    try {
      // Split by lines and process each data: line
      const lines = text.split('\n');
      let extractedContent = '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        // Skip empty lines
        if (!trimmedLine) continue;
        
        // Check if line starts with data:
        if (trimmedLine.startsWith('data:')) {
          // Extract JSON part after data:
          const jsonStr = trimmedLine.substring(5).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          
          try {
            const jsonData = JSON.parse(jsonStr);
            // Only process content_delta events with actual content
            if (jsonData.event === 'content_delta' && 
                jsonData.choices && 
                jsonData.choices[0]?.delta?.content) {
              extractedContent += jsonData.choices[0].delta.content;
            }
          } catch (jsonError) {
            console.error('Error parsing JSON in stream:', jsonError);
          }
        }
      }
      return extractedContent || text; // Return extracted content or original if nothing was extracted
    } catch (error) {
      console.error('Error processing Claude stream:', error);
      return text; // Return original text on error
    }
  };

  const handleConvert = () => {
    if (!inputText.trim()) {
      toast.warn('Please enter or upload some text first');
      return;
    }
    
    setIsConverting(true);
    
    // Simulate processing delay for better UX
    setTimeout(() => {
      try {
        // First, process Claude's streaming format if present
        let processedText = processClaudeStream(inputText);
        
        // Log the initial extraction result
        console.log('Extracted content from stream:', processedText.substring(0, 100) + '...');
        
        // Remove timestamps (like [14:23] or 11:45:02)
        if (settings.removeTimestamps) {
          processedText = processedText.replace(/\[\d{1,2}:\d{2}(:\d{2})?\]|\d{1,2}:\d{2}(:\d{2})?/g, '');
        }
        
        // Remove progress indicators ([=====>   ] style progress bars)
        if (settings.removeProgressBars) {
          processedText = processedText.replace(/\[=*>*\s*\]/g, '');
        }
        
        // Clean up extra spaces and format
        processedText = processedText
          .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
          .replace(/\n\s*\n/g, '\n\n'); // Keep paragraph breaks
        
        // Preserve paragraphs if enabled
        if (settings.preserveParagraphs) {
          // This is a simplistic approach - in a real app, more sophisticated 
          // paragraph detection would be implemented
          processedText = processedText
            .split('\n\n')
            .map(para => para.trim())
            .filter(para => para)
            .join('\n\n');
        }
        
        // Merge lines if requested
        if (settings.mergeLines) {
          processedText = processedText.replace(/\n/g, ' ');
        }
        
        // Final cleanup
        processedText = processedText.trim();
        
        setOutputText(processedText);
        setHasOutput(true);
        toast.success('Text converted successfully!');
      } catch (error) {
        toast.error('Error converting text: ' + error.message);
      } finally {
        setIsConverting(false);
      }
    }, 800);
  };
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      className="flex flex-col space-y-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {/* Settings Panel */}
      <motion.div 
        className="card p-4 md:p-6"
        variants={cardVariants}
      >
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="text-primary" />
          <h2 className="text-lg font-semibold">Conversion Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => toggleSetting('removeTimestamps')}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              settings.removeTimestamps 
                ? 'bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40' 
                : 'bg-surface-100 dark:bg-surface-700 border-surface-200 dark:border-surface-600'
            }`}
          >
            <span>Remove Timestamps</span>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              settings.removeTimestamps ? 'bg-primary text-white' : 'bg-surface-300 dark:bg-surface-500'
            }`}>
              {settings.removeTimestamps && <CheckIcon size={12} />}
            </div>
          </button>
          
          <button 
            onClick={() => toggleSetting('removeProgressBars')}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              settings.removeProgressBars 
                ? 'bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40' 
                : 'bg-surface-100 dark:bg-surface-700 border-surface-200 dark:border-surface-600'
            }`}
          >
            <span>Remove Progress Bars</span>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              settings.removeProgressBars ? 'bg-primary text-white' : 'bg-surface-300 dark:bg-surface-500'
            }`}>
              {settings.removeProgressBars && <CheckIcon size={12} />}
            </div>
          </button>
          
          <button 
            onClick={() => toggleSetting('preserveParagraphs')}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              settings.preserveParagraphs 
                ? 'bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40' 
                : 'bg-surface-100 dark:bg-surface-700 border-surface-200 dark:border-surface-600'
            }`}
          >
            <span>Preserve Paragraphs</span>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              settings.preserveParagraphs ? 'bg-primary text-white' : 'bg-surface-300 dark:bg-surface-500'
            }`}>
              {settings.preserveParagraphs && <CheckIcon size={12} />}
            </div>
          </button>
          
          <button 
            onClick={() => toggleSetting('mergeLines')}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              settings.mergeLines 
                ? 'bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40' 
                : 'bg-surface-100 dark:bg-surface-700 border-surface-200 dark:border-surface-600'
            }`}
          >
            <span>Merge Lines</span>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              settings.mergeLines ? 'bg-primary text-white' : 'bg-surface-300 dark:bg-surface-500'
            }`}>
              {settings.mergeLines && <CheckIcon size={12} />}
            </div>
          </button>
        </div>
      </motion.div>

      {/* Input Section */}
      <motion.div 
        className="card"
        variants={cardVariants}
      >
        <div className="px-6 pt-6 pb-4 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">Claude Input Text</h2>
              <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
                Paste Claude's JSON stream or upload a text file
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFileButtonClick}
                className="btn btn-outline px-3 py-1.5 text-sm"
              >
                <FileUpIcon className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Upload File</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".txt"
                className="hidden"
              />
              <button
                onClick={handleClear}
                className="btn btn-outline px-3 py-1.5 text-sm"
                disabled={!inputText}
              >
                <TrashIcon className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>
        </div>
        
        <div 
          className={`relative ${dragActive ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste Claude's output here..."
            className="w-full px-6 py-4 min-h-[200px] bg-transparent resize-y focus:outline-none"
            spellCheck="false"
          />
          
          {dragActive && (
            <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-primary rounded-b-xl">
              <div className="text-center p-4">
                <FileUpIcon className="mx-auto w-10 h-10 text-primary mb-2" />
                <p className="font-medium">Drop your text file here</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 rounded-b-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400">
              <InfoIcon className="w-4 h-4" />
              <span className="text-xs">
                {inputText.length > 0 
                  ? `${inputText.length} characters · ${inputText.split(/\s+/).filter(Boolean).length} words`
                  : 'No text entered yet'}
              </span>
            </div>
            
            <motion.button
              onClick={handleConvert}
              disabled={isConverting || !inputText.trim()}
              className="btn btn-primary w-full sm:w-auto py-2.5 text-white gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.95 }}
            >
              {isConverting ? (
                <>
                  <LoaderIcon className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <WandIcon className="w-5 h-5" />
                  <span>Convert Text</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Output Section */}
      <AnimatePresence>
        {hasOutput && (
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="px-6 pt-6 pb-4 border-b border-surface-200 dark:border-surface-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Converted Text</h2>
                  <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
                    Clean, formatted output ready to use
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="btn btn-outline px-3 py-1.5 text-sm"
                  >
                    <ClipboardIcon className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="btn btn-outline px-3 py-1.5 text-sm"
                  >
                    <DownloadIcon className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-surface-50/70 dark:bg-surface-800/30 rounded-b-xl">
              <pre ref={outputRef} className="whitespace-pre-wrap font-sans text-surface-800 dark:text-surface-100">
                {outputText}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Example/Help Section */}
      <motion.div 
        className="card p-6"
        variants={cardVariants}
      >
        <h3 className="text-lg font-semibold mb-2">Example of Claude's Stream Format</h3>
        <div className="bg-surface-100 dark:bg-surface-700 rounded-lg p-4 mb-4 overflow-x-auto text-sm">
          <code className="whitespace-pre-wrap text-surface-700 dark:text-surface-300">
{`data: {"id":"msg123","model":"claude-3","event":"content_delta","choices":[{"delta":{"content":"The quick "},"finish_reason":null}]}

data: {"id":"msg123","model":"claude-3","event":"content_delta","choices":[{"delta":{"content":"brown fox "},"finish_reason":null}]}

data: {"id":"msg123","model":"claude-3","event":"content_delta","choices":[{"delta":{"content":"jumps over "},"finish_reason":null}]}

data: {"id":"msg123","model":"claude-3","event":"content_delta","choices":[{"delta":{"content":"the lazy dog."},"finish_reason":null}]}

data: {"id":"msg123","model":"claude-3","event":"finish_reason","choices":[{"delta":{"content":null},"finish_reason":"stop"}]}`}
          </code>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">What This Tool Does</h3>
        <ul className="list-disc pl-5 space-y-1 text-surface-700 dark:text-surface-300">
          <li>Removes timestamps like [10:23:45]</li>
          <li>Removes progress bars like [====>   ]</li>
          <li>Extracts content from Claude's JSON stream format</li>
          <li>Combines partial content from streaming responses</li>
          <li>Formats text with proper paragraphs</li>
          <li>Produces clean, readable text</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}

export default MainFeature;