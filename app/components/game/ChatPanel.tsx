'use client';

import { useState, useEffect, useRef } from 'react';
import { useRoomStore } from '../../store/roomStore';
import { useUserStore } from '../../store/userStore';
import { useSocketStore } from '../../store/socketStore';

interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const roomId = useRoomStore(state => state.roomId);
  const playerId = useUserStore(state => state.playerId);
  const playerName = useUserStore(state => state.playerName);
  const { socket } = useSocketStore();

  // 初始化通知音效
  useEffect(() => {
    audioRef.current = new Audio('/audio/notification.mp3');
  }, []);

  // 监听新消息
  useEffect(() => {
    if (!socket) return;
    
    const handleChatMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // 如果聊天面板未打开，增加未读消息数
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
        // 播放通知音效（如果不是自己发送的消息）
        if (message.sender !== playerId && audioRef.current) {
          audioRef.current.play().catch(err => console.log('无法播放通知音效', err));
        }
      }
    };
    
    socket.on('chatMessage', handleChatMessage);
    
    // 系统消息（例如玩家加入/离开）
    socket.on('systemMessage', (message: Message) => {
      setMessages(prev => [...prev, { ...message, isSystem: true }]);
      if (!isOpen && audioRef.current) {
        audioRef.current.play().catch(err => console.log('无法播放通知音效', err));
      }
    });
    
    return () => {
      socket.off('chatMessage', handleChatMessage);
      socket.off('systemMessage');
    };
  }, [socket, isOpen, playerId]);

  // 消息列表自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 打开聊天面板时，清除未读消息计数
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      // 聊天框打开时自动聚焦到输入框
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

  const sendMessage = () => {
    if (!socket || !roomId || !inputValue.trim()) return;
    
    const message: Omit<Message, 'id' | 'timestamp'> = {
      sender: playerId || '',
      senderName: playerName || '玩家',
      text: inputValue.trim()
    };
    
    socket.emit('sendMessage', { roomId, message }, (response: { success: boolean }) => {
      if (response.success) {
        setInputValue('');
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      {/* 浮动聊天按钮 */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-all z-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 聊天面板 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:p-0">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[500px] max-h-[90vh] flex flex-col">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-purple-50">
              <h3 className="font-bold text-lg text-purple-800">聊天室</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>暂无消息，发送第一条消息开始聊天吧！</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`relative ${
                        message.isSystem 
                          ? 'mx-auto text-center py-1 max-w-full' 
                          : message.sender === playerId
                            ? 'ml-auto'
                            : 'mr-auto'
                      }`}
                    >
                      {message.isSystem ? (
                        <div className="bg-gray-200 text-gray-600 text-xs py-1 px-3 rounded-full inline-block">
                          {message.text}
                        </div>
                      ) : message.sender === playerId ? (
                        <div className="bg-purple-500 text-white p-3 rounded-lg rounded-tr-none shadow-md max-w-[85%] transform transition-transform hover:scale-[1.02]">
                          <p className="break-words">{message.text}</p>
                          <p className="text-xs text-purple-200 text-right mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-md max-w-[85%] border-l-4 border-blue-500 transform transition-transform hover:scale-[1.02]">
                          <p className="text-xs font-bold text-blue-600 mb-1">{message.senderName}</p>
                          <p className="break-words text-gray-800">{message.text}</p>
                          <p className="text-xs text-gray-400 text-right mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入消息..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 