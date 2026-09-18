
import React, { useState, useRef, useEffect } from 'react';
import { askMarketingAssistant } from '../services/geminiService';

const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

const ChatWidget: React.FC = React.memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
        { role: 'assistant', text: "Hello! I'm Jenta AI. I can help you research competitors, optimize your marketing strategy, or brainstorm your next viral ad hook. What's on your mind?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));
            history.push({ role: 'user', text: userMsg });
            
            const response = await askMarketingAssistant(history);
            setMessages(prev => [...prev, { role: 'assistant', text: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I hit a snag. Let's try that again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-8 z-[100] flex flex-col items-end">
            {isOpen && (
                <div className="glass-card w-[350px] md:w-[400px] h-[500px] rounded-[2rem] flex flex-col overflow-hidden mb-4 shadow-2xl border border-white/10 animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="p-5 bg-gradient-to-r from-[var(--color-accent)]/20 to-transparent border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white shadow-lg">
                                <BotIcon />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Marketing Expert</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] text-white/40 font-bold uppercase">Online Now</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white/60 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 suggestions-scrollbar">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                                    m.role === 'user' 
                                        ? 'bg-[var(--color-accent)] text-white font-bold rounded-tr-none' 
                                        : 'bg-white/5 text-white/80 font-medium rounded-tl-none border border-white/5'
                                }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-bounce delay-100"></div>
                                    <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/5 bg-black/20">
                        <div className="relative">
                            <input 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about e-commerce..."
                                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 pr-12 text-sm text-white focus:border-[var(--color-accent)]/50 focus:ring-0 outline-none font-medium"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1.5 w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
                            >
                                <SendIcon />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-90 ${
                    isOpen ? 'bg-white/10 border border-white/10' : 'bg-[var(--color-accent)]'
                }`}
            >
                {isOpen ? <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg> : <BotIcon />}
                {!isOpen && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-black rounded-full animate-pulse"></div>
                )}
            </button>
        </div>
    );
});

export default ChatWidget;
