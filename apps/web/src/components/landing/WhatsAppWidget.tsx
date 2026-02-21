import { Button } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { SendHorizontal, X } from 'lucide-react';
import { useState } from 'react';

export const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const phoneNumber = '+233559617959';

  const handleSendMessage = () => {
    if (message.trim()) {
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber.replace(
        '+',
        ''
      )}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      setMessage('');
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center p-0"
          size="icon"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            width={32}
            height={32}
          />
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-white dark:bg-zinc-900 rounded-lg shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="bg-green-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                  width={24}
                  height={24}
                />
                <span className="font-medium">Chat with us!</span>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-green-700 p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Content */}
            <div className="p-4 bg-green-50 dark:bg-zinc-800/50 min-h-50">
              {/* Welcome Message */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 mb-4 shadow-sm">
                <div className="flex items-start space-x-2">

                  <div>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200">
                      Hi there! 👋 How can we help you today?
                    </p>
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      Just now
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="rounded-full w-8 h-8 bg-green-500 hover:bg-green-600"
                  disabled={!message.trim()}
                >
                  <SendHorizontal />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence >
    </>
  );
};
