import { Card } from './ui/card';

export interface Message {
  type: 'question' | 'answer';
  text: string;
  timestamp: Date;
}

interface ConversationDisplayProps {
  messages: Message[];
}

export const ConversationDisplay = ({ messages }: ConversationDisplayProps) => {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg">Start recording to begin</p>
          <p className="text-sm mt-2">Ask any question and get instant answers</p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === 'question' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <Card className={`p-4 max-w-[80%] ${
              msg.type === 'question' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card border-primary/30'
            }`}>
              <div className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  msg.type === 'question' ? 'bg-primary-foreground' : 'bg-primary'
                }`} />
                <div>
                  <p className="text-sm font-medium mb-1">
                    {msg.type === 'question' ? 'Question' : 'Answer'}
                  </p>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className="text-xs opacity-60 mt-2">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ))
      )}
    </div>
  );
};
