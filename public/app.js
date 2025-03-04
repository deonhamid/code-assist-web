// File: public/app.js
console.log('app.js is loading');

let monaco;
let editor;

// Load Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});

require(['vs/editor/editor.main'], function() {
  console.log('Monaco modules loaded');
  
  try {
    monaco = window.monaco;
    if (!monaco) {
      console.error('Monaco not available on window object');
      return;
    }
    
    const editorElement = document.getElementById('editor');
    if (!editorElement) {
      console.error('Editor element not found');
      return;
    }
    
    // Create editor
    editor = monaco.editor.create(editorElement, {
      value: '// Start coding here...',
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: {
        enabled: true
      }
    });
    console.log('Editor created successfully');
    
    // Setup event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Error initializing editor:', error);
  }
});

function setupEventListeners() {
  console.log('Setting up event listeners');
  
  try {
    // Check if elements exist
    const askButton = document.getElementById('ask-button');
    const explainButton = document.getElementById('explain-button');
    const completeButton = document.getElementById('complete-button');
    const downloadButton = document.getElementById('download-button');
    
    if (!askButton) console.error('ask-button element not found');
    if (!explainButton) console.error('explain-button element not found');
    if (!completeButton) console.error('complete-button element not found');
    if (!downloadButton) console.error('download-button element not found');
    
    // AI interactions
    if (askButton) {
      askButton.addEventListener('click', () => {
        console.log('Ask button clicked');
        askAI('general');
      });
    }
    
    if (explainButton) {
      explainButton.addEventListener('click', () => {
        console.log('Explain button clicked');
        askAI('explain');
      });
    }
    
    if (completeButton) {
      completeButton.addEventListener('click', () => {
        console.log('Complete button clicked');
        askAI('complete');
      });
    }
    
    // Download file
    if (downloadButton) {
      downloadButton.addEventListener('click', () => {
        console.log('Download button clicked');
        downloadCode();
      });
    }
  } catch (error) {
    console.error('Error setting up event listeners:', error);
  }
}

async function askAI(mode) {
  console.log(`askAI called with mode: ${mode}`);
  
  try {
    const apiKeyElement = document.getElementById('api-key');
    if (!apiKeyElement) {
      console.error('api-key element not found');
      return;
    }
    
    const apiKey = apiKeyElement.value;
    if (!apiKey) {
      updateAIResponse('Please enter your API key first.');
      return;
    }
    
    const code = editor.getValue();
    
    const promptElement = document.getElementById('ai-prompt');
    if (!promptElement) {
      console.error('ai-prompt element not found');
      return;
    }
    
    let prompt = promptElement.value;
    
    if (mode === 'explain' && !prompt) {
      prompt = 'Explain the following code in detail:';
    } else if (mode === 'complete' && !prompt) {
      prompt = 'Complete the following code:';
    } else if (!prompt) {
      prompt = 'Analyze the following code and provide suggestions:';
    }
    
    updateAIResponse('Thinking...');
    
    console.log('Making API request...');
    const response = await fetch('/api/ask-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, code, apiKey })
    });
    
    console.log('API response received');
    const data = await response.json();
    if (data.error) {
      console.error('API returned error:', data.error);
      updateAIResponse(`Error: ${data.error}`);
    } else {
      updateAIResponse(data.response);
    }
  } catch (error) {
    console.error('Error in askAI function:', error);
    updateAIResponse(`Error: ${error.message}`);
  }
}

function updateAIResponse(text) {
  try {
    const responseElement = document.getElementById('ai-response');
    if (!responseElement) {
      console.error('ai-response element not found');
      return;
    }
    responseElement.textContent = text;
  } catch (error) {
    console.error('Error updating AI response:', error);
  }
}

function downloadCode() {
  try {
    const code = editor.getValue();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.js'; // Default filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading code:', error);
  }
}

// Change language based on file extension
function changeLanguage(filename) {
  try {
    if (!filename) return;
    
    const extension = filename.split('.').pop();
    const languageMap = {
      'js': 'javascript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'txt': 'plaintext'
    };
    
    const language = languageMap[extension] || 'plaintext';
    monaco.editor.setModelLanguage(editor.getModel(), language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
}
