import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// TODO: Integrate Gemini API here
// Requires backend proxy for API key security
const GEMINI_SYSTEM_PROMPT = `
You are Yatra Sahayak, a helpful spiritual guide for pilgrims visiting temples in Gujarat (Somnath, Dwarka, Ambaji, Pavagadh). 
Provide accurate information about timings, history, and crowd status. 
Be polite, use "Namaste" or "Jay Somnath/Jay Dwarkadhish" where appropriate.
Keep answers concise and helpful.
`;

export function PilgrimAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Jay Somnath! 🙏 I am your Yatra Sahayak. I can help you plan your visit to Somnath, Dwarka, Ambaji, or Pavagadh. Ask me about 'Best time to visit Dwarka' or 'Crowd status at Ambaji'." 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Call backend AI chat API
      const sessionId = sessionStorage.getItem("chatSessionId") || crypto.randomUUID();
      sessionStorage.setItem("chatSessionId", sessionId);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          sessionId
        })
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, I'm having trouble connecting right now. Please try again." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-primary p-4 text-primary-foreground flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-lg">Yatra Sahayak AI</h3>
          <p className="text-xs text-white/80 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Online
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4 bg-muted/10">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex w-full gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className={cn(
                "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                  : "bg-card border border-border rounded-tl-none"
              )}>
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex w-full gap-3 justify-start">
               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-card border-t border-border">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for darshan timings, crowd status..." 
            className="flex-1 rounded-full bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isTyping}
            className="rounded-full h-10 w-10 shrink-0 shadow-md transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
