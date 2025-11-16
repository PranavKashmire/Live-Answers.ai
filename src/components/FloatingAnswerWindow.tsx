import { useEffect, useRef } from 'react';
import { Message } from './ConversationDisplay';

interface FloatingAnswerWindowProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

export const FloatingAnswerWindow = ({ messages, isOpen, onClose }: FloatingAnswerWindowProps) => {
  const windowRef = useRef<Window | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen && !windowRef.current) {
      // Open a popup window
      const width = 400;
      const height = 300;
      const left = window.screen.width - width - 20;
      const top = 100;

      windowRef.current = window.open(
        '',
        'LiveAnswerAI',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (windowRef.current) {
        // Initial content
        windowRef.current.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Live Answer AI</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 20px;
                  overflow-y: auto;
                }
                .container {
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                  border-radius: 12px;
                  padding: 20px;
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
                h1 {
                  font-size: 18px;
                  margin-bottom: 16px;
                  font-weight: 600;
                }
                .message {
                  background: rgba(255, 255, 255, 0.15);
                  border-radius: 8px;
                  padding: 12px;
                  margin-bottom: 12px;
                  animation: fadeIn 0.3s ease-in;
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .label {
                  font-size: 11px;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin-bottom: 6px;
                  opacity: 0.9;
                }
                .text {
                  font-size: 14px;
                  line-height: 1.5;
                }
                .timestamp {
                  font-size: 11px;
                  opacity: 0.7;
                  margin-top: 8px;
                }
                .empty {
                  text-align: center;
                  opacity: 0.7;
                  padding: 40px 20px;
                  font-size: 14px;
                }
                .question {
                  background: rgba(103, 126, 234, 0.3);
                }
                .answer {
                  background: rgba(118, 75, 162, 0.3);
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🎙️ Live Answers</h1>
                <div id="messages"></div>
              </div>
            </body>
          </html>
        `);
        windowRef.current.document.close();

        // Handle window close
        windowRef.current.addEventListener('beforeunload', () => {
          onClose();
        });
      }
    }

    // Update content when messages change
    if (windowRef.current && !windowRef.current.closed) {
      const messagesContainer = windowRef.current.document.getElementById('messages');
      if (messagesContainer) {
        if (messages.length === 0) {
          messagesContainer.innerHTML = '<div class="empty">Waiting for questions...</div>';
        } else {
          // Show last 3 Q&A pairs
          const recentMessages = messages.slice(-6);
          messagesContainer.innerHTML = recentMessages.map(msg => `
            <div class="message ${msg.type}">
              <div class="label">${msg.type === 'question' ? '❓ Question' : '💡 Answer'}</div>
              <div class="text">${msg.text}</div>
              <div class="timestamp">${msg.timestamp.toLocaleTimeString()}</div>
            </div>
          `).join('');
          
          // Auto-scroll to bottom
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    }

    // Check if window is still open
    intervalRef.current = setInterval(() => {
      if (windowRef.current && windowRef.current.closed) {
        onClose();
      }
    }, 500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [messages, isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (windowRef.current && !windowRef.current.closed) {
        windowRef.current.close();
      }
    };
  }, []);

  return null;
};
