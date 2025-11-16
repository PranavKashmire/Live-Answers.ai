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
    const openPiPWindow = async () => {
      if (isOpen && !windowRef.current) {
        try {
          // Use Document Picture-in-Picture API (Chrome/Edge only)
          // @ts-ignore - Document PiP is experimental
          if ('documentPictureInPicture' in window) {
            // @ts-ignore
            const pipWindow = await window.documentPictureInPicture.requestWindow({
              width: 400,
              height: 300,
            });

            windowRef.current = pipWindow;

            // Copy styles to PiP window
            const styleSheets = Array.from(document.styleSheets);
            styleSheets.forEach((styleSheet) => {
              try {
                const cssRules = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('\n');
                const style = pipWindow.document.createElement('style');
                style.textContent = cssRules;
                pipWindow.document.head.appendChild(style);
              } catch (e) {
                // External stylesheets might fail due to CORS
                const link = pipWindow.document.createElement('link');
                link.rel = 'stylesheet';
                // @ts-ignore
                link.href = styleSheet.href;
                pipWindow.document.head.appendChild(link);
              }
            });

            // Initial content
            pipWindow.document.body.innerHTML = `
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
                  height: 100vh;
                }
                .container {
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                  border-radius: 12px;
                  padding: 20px;
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                }
                h1 {
                  font-size: 18px;
                  margin-bottom: 16px;
                  font-weight: 600;
                }
                #messages {
                  flex: 1;
                  overflow-y: auto;
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
              <div class="container">
                <h1>🎙️ Live Answers</h1>
                <div id="messages"></div>
              </div>
            `;

            // Handle window close
            // @ts-ignore
            window.documentPictureInPicture.addEventListener('leave', () => {
              onClose();
            });
          } else {
            // Fallback to regular popup for unsupported browsers
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
              windowRef.current.document.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Live Answer AI</title>
                    <style>
                      * { margin: 0; padding: 0; box-sizing: border-box; }
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
                      h1 { font-size: 18px; margin-bottom: 16px; font-weight: 600; }
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
                      .text { font-size: 14px; line-height: 1.5; }
                      .timestamp { font-size: 11px; opacity: 0.7; margin-top: 8px; }
                      .empty {
                        text-align: center;
                        opacity: 0.7;
                        padding: 40px 20px;
                        font-size: 14px;
                      }
                      .question { background: rgba(103, 126, 234, 0.3); }
                      .answer { background: rgba(118, 75, 162, 0.3); }
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

              windowRef.current.addEventListener('beforeunload', () => {
                onClose();
              });
            }
          }
        } catch (error) {
          console.error('Failed to open PiP window:', error);
        }
      }
    };

    openPiPWindow();

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
