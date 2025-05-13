import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

function ConvertedTextView() {
  const [text, setText] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  
  const textContainerRef = useRef(null);
  const navigate = useNavigate();
  
  // Icons
  const ArrowLeftIcon = getIcon('ArrowLeft');
  const SearchIcon = getIcon('Search');
  const DownloadIcon = getIcon('Download');
  const ClipboardIcon = getIcon('Clipboard');
  const ChevronUpIcon = getIcon('ChevronUp');
  const ChevronDownIcon = getIcon('ChevronDown');
  const XCircleIcon = getIcon('XCircle');

  useEffect(() => {
    // Retrieve the converted text from localStorage
    const savedText = localStorage.getItem('convertedText');
    if (!savedText) {
      toast.error('No converted text found!');
      navigate('/');
      return;
    }
    
    setText(savedText);
    
    // If there's a search query in URL, perform search
    if (searchParams.get('q')) {
      handleSearch();
    }
  }, [navigate]);
  
  useEffect(() => {
    // Update search when params change
    if (searchText) {
      handleSearch();
    }
  }, [caseSensitive, searchText]);
  
  const handleSearch = () => {
    if (!searchText.trim()) {
      setMatches([]);
      return;
    }
    
    // Update URL search params
    setSearchParams({ q: searchText });
    
    // Find all occurrences of search text
    const searchRegex = new RegExp(
      searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 
      caseSensitive ? 'g' : 'gi'
    );
    
    let match;
    const foundMatches = [];
    let textCopy = text;
    
    while ((match = searchRegex.exec(textCopy)) !== null) {
      foundMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0]
      });
    }
    
    setMatches(foundMatches);
    setCurrentMatch(foundMatches.length > 0 ? 0 : -1);
    
    // Show feedback about search results
    if (foundMatches.length > 0) {
      toast.info(`Found ${foundMatches.length} match${foundMatches.length === 1 ? '' : 'es'}`);
    } else {
      toast.info('No matches found');
    }
  };
  
  const navigateToMatch = (direction) => {
    if (matches.length === 0) return;
    
    if (direction === 'next') {
      setCurrentMatch((prev) => (prev + 1) % matches.length);
    } else {
      setCurrentMatch((prev) => (prev - 1 + matches.length) % matches.length);
    }
  };
  
  useEffect(() => {
    // Scroll to current match
    if (matches.length > 0 && currentMatch >= 0 && textContainerRef.current) {
      const matchElements = textContainerRef.current.querySelectorAll('.highlight-current');
      if (matchElements.length > 0) {
        matchElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMatch, matches]);
  
  const clearSearch = () => {
    setSearchText('');
    setMatches([]);
    setSearchParams({});
  };
  
  const handleCopyToClipboard = () => {
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => toast.success('Copied to clipboard!'))
        .catch(err => toast.error('Failed to copy: ' + err.message));
    }
  };
  
  const handleDownload = () => {
    if (text) {
      const blob = new Blob([text], { type: 'text/plain' });
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
  
  // Highlight matches in text
  const renderHighlightedText = () => {
    if (!text) return '';
    
    if (matches.length === 0 || !searchText) {
      return <span>{text}</span>;
    }
    
    const segments = [];
    let lastIndex = 0;
    
    matches.forEach((match, idx) => {
      // Add text before the match
      if (match.start > lastIndex) {
        segments.push(<span key={`text-${idx}`}>{text.slice(lastIndex, match.start)}</span>);
      }
      
      // Add highlighted match
      segments.push(
        <span 
          key={`match-${idx}`} 
          className={`${idx === currentMatch ? 'highlight-current bg-primary/50' : 'highlight bg-primary/20'} px-0.5 rounded`}
        >
          {text.slice(match.start, match.end)}
        </span>
      );
      
      lastIndex = match.end;
    });
    
    // Add text after the last match
    if (lastIndex < text.length) {
      segments.push(<span key="text-end">{text.slice(lastIndex)}</span>);
    }
    
    return segments;
  };
  
  return (
    <div className="flex flex-col space-y-4">
      {/* Header with back button and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="btn btn-outline"
          >
            <ArrowLeftIcon size={16} className="mr-2" />
            Back to Converter
          </button>
          <h1 className="text-xl font-semibold">Converted Text</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyToClipboard}
            className="btn btn-outline"
          >
            <ClipboardIcon size={16} className="mr-2" />
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-outline"
          >
            <DownloadIcon size={16} className="mr-2" />
            Download
          </button>
        </div>
      </div>
      
      {/* Search box */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={18} className="text-surface-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10 pr-10 py-2 w-full"
              placeholder="Search in text..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchText && (
              <button 
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={clearSearch}
              >
                <XCircleIcon size={18} className="text-surface-400 hover:text-surface-600" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
              className={`btn ${caseSensitive ? 'btn-primary' : 'btn-outline'}`}
            >
              Case Sensitive
            </button>
            
            {matches.length > 0 && (
              <div className="flex items-center bg-surface-100 dark:bg-surface-700 rounded-lg p-2">
                <button
                  onClick={() => navigateToMatch('prev')}
                  className="p-1 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-md"
                >
                  <ChevronUpIcon size={18} />
                </button>
                <span className="px-2 text-sm">
                  {currentMatch + 1} / {matches.length}
                </span>
                <button
                  onClick={() => navigateToMatch('next')}
                  className="p-1 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-md"
                >
                  <ChevronDownIcon size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Text display */}
      <div className="card p-6 bg-white dark:bg-surface-800">
        <div 
          ref={textContainerRef}
          className="whitespace-pre-wrap break-words font-sans text-surface-800 dark:text-surface-100 max-h-[70vh] overflow-y-auto"
        >
          {renderHighlightedText()}
        </div>
      </div>
    </div>
  );
}

export default ConvertedTextView;