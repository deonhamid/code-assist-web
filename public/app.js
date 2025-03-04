console.log('app.js is loading');

let monacoInstance;
let editor;

// Dynamically Load Monaco Editor
function loadMonaco() {
  return new Promise((resolve, reject) => {
    if (window.monaco) {
      resolve(window.monaco);
      return;
    }

    const monacoScript = document.createElement('script');
    monacoScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs/loader.js';
    monacoScript.onload = () => {
      require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' } });
      require(['vs/editor/editor.main'], () => {
        monacoInstance = window.monaco;
        resolve(monacoInstance);
      });
    };
    monacoScript.onerror = reject;
    document.body.appendChild(monacoScript);
  });
}

// Initialize Monaco Editor
async function initEditor() {
  console.log('Initializing Monaco Editor...');
  try {
    await loadMonaco();
    const editorElement = document.getElementById('editor');

    if (!editorElement) {
      console.error('Editor element not found');
      return;
    }

    editor = monacoInstance.editor.create(editorElement, {
      value: '// Start coding here...',
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: true }
    });

    console.log('Editor initialized successfully');
    setupEventListeners();
  } catch (error) {
    console.error('Error loading Monaco:', error);
  }
}

// Set Up Event Listeners
function setupEventListeners() {
  console.log('Setting up event listeners');

  const buttons = {
    ask: document.getElementById('ask-button'),
    explain: document.getElementById('explain-button'),
    complete: document.getElementById('complete-button'),
    download: document.getElementById('download-button')
  };

  Object.entries(buttons).forEach(([name, button]) => {
    if (!button) {
      console.warn(`${name}-button not found`);
      return;
    }
    button.addEventListener('click', () => handleButtonClick(name));
  });
}

function handleButtonClick(action) {
  console.log(`${action} button clicked`);
  if (action === 'download') {
    downloadCode();
  } else {
    askAI(action);
  }
}

// Call AI API
async function askAI(mode) {
  console.log(`askAI called with mode: ${mode}`);

  try {
    const apiKey = document.getElementById('api-key')?.value;
    if (!apiKey) {
      updateAIResponse('Please enter your API key first.');
      return;
    }

    const code = editor.getValue();
    const promptElement = document.getElementById('ai-prompt');
    let prompt = promptElement?.value || '';

    if (mode === 'explain' && !prompt) prompt = 'Explain the following code:';
    else if (mode === 'complete' && !prompt) prompt = 'Complete the following code:';
    else if (!prompt) prompt = 'Analyze this code and provide suggestions:';

    updateAIResponse('Thinking...');

    console.log('Making API request...');
    const response = await fetch('/ask-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, code, apiKey })
    });

    console.log('API response received');
    const data = await response.json();

    if (data.error) {
      console.error('API error:', data.error);
      updateAIResponse(`Error: ${data.error}`);
    } else {
      updateAIResponse(data.response);
    }
  } catch (error) {
    console.error('Error in askAI:', error);
    updateAIResponse(`Error: ${error.message}`);
  }
}

// Update AI Response Text
function updateAIResponse(text) {
  const responseElement = document.getElementById('ai-response');
  if (!responseElement) {
    console.error('ai-response element not found');
    return;
  }
  responseElement.textContent = text;
}

// Download Code
function downloadCode() {
  try {
    const code = editor.getValue();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading code:', error);
  }
}

// Change Language Based on File Extension
function changeLanguage(filename) {
  try {
    if (!filename) return;
    const extension = filename.split('.').pop();
    const languageMap = {
      'js': 'javascript', 'py': 'python', 'html': 'html', 'css': 'css',
      'json': 'json', 'md': 'markdown', 'txt': 'plaintext'
    };
    const language = languageMap[extension] || 'plaintext';
    monacoInstance.editor.setModelLanguage(editor.getModel(), language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
}

// Start the editor
initEditor();
