import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertTriangle, FileText, Loader2, Zap, Brain, Save, CheckCircle } from 'lucide-react';
import { ChatMessage, ClinicalNote } from '../types';
import { getGeminiResponse } from '../services/gemini';
import { useData } from '../context/DataContext';

const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', icon: Zap, label: 'Fast' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', icon: Brain, label: 'Smart' }
];

const AiAssistant: React.FC = () => {
  const { patients, addClinicalNote } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello, I am MedCore AI. I can assist you with symptom triage, analyzing patient notes, or finding drug interactions. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Drug Interaction Modal State
  const [showDrugModal, setShowDrugModal] = useState(false);
  const [drugList, setDrugList] = useState<string[]>(['']);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Context Awareness
      let prompt = userMsg.text;
      if (selectedPatientId) {
        const patient = patients.find(p => p.id === selectedPatientId);
        if (patient) {
            prompt = `Context: Patient ${patient.fullName}, ${patient.age}y, ${patient.gender}, Condition: ${patient.condition}.\n\nUser Query: ${userMsg.text}`;
        }
      }

      const responseText = await getGeminiResponse(prompt, selectedModel);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error connecting to the service.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = (text: string) => {
    if (!selectedPatientId) return;
    
    const note: ClinicalNote = {
        id: `N${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        doctorId: 'CURRENT_USER', // In real app, get from auth context
        doctorName: 'MedCore AI',
        content: text,
        type: 'General'
    };
    
    addClinicalNote(selectedPatientId, note);
  };

  const handleDrugInput = (index: number, value: string) => {
    const newDrugs = [...drugList];
    newDrugs[index] = value;
    setDrugList(newDrugs);
  };

  const addDrugField = () => setDrugList([...drugList, '']);
  const removeDrugField = (index: number) => {
    const newDrugs = drugList.filter((_, i) => i !== index);
    setDrugList(newDrugs);
  };

  const submitDrugCheck = async () => {
    const drugs = drugList.filter(d => d.trim() !== '');
    if (drugs.length < 2) return;

    setShowDrugModal(false);
    
    const prompt = `
      Act as a clinical pharmacist. 
      Analyze the interactions between the following drugs: ${drugs.join(', ')}.
      
      Provide a structured response with:
      1. Severity of Interaction (Major/Moderate/Minor)
      2. Mechanism of Interaction
      3. Clinical Management Recommendation
    `;
    
    setInput(`Check interactions for: ${drugs.join(', ')}`);
    // Manually trigger the flow to make it look like user asked
    // Ideally we refactor handleSend to accept text argument, but for now:
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: `Check interactions for: ${drugs.join(', ')}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
        const responseText = await getGeminiResponse(prompt, selectedModel);
        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
    } finally {
        setIsLoading(false);
    }
  };

  // Predefined prompts for demo
  const quickPrompts = [
    { icon: AlertTriangle, text: "Triage: 45M, chest pain radiating to left arm, sweating." },
    { icon: FileText, text: "Draft discharge summary for viral pneumonia patient." },
    { icon: Sparkles, text: "Interactions between Warfarin and Aspirin?" }
  ];

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">MedCore Assistant</h3>
            <div className="flex items-center gap-4 mt-0.5">
               <div className="flex items-center gap-2">
                   <div className="flex items-center text-xs text-slate-500">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                      Model:
                   </div>
                   <div className="relative">
                      <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="text-xs appearance-none bg-white border border-slate-200 rounded-md py-1 pl-2 pr-6 text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        {MODELS.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.label})</option>
                        ))}
                      </select>
                   </div>
               </div>
               
               <div className="flex items-center gap-2">
                   <div className="flex items-center text-xs text-slate-500">
                      <User size={10} className="mr-1.5" />
                      Context:
                   </div>
                   <select 
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="text-xs appearance-none bg-white border border-slate-200 rounded-md py-1 pl-2 pr-6 text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-colors max-w-[150px]"
                   >
                      <option value="">None (General)</option>
                      {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.fullName}</option>
                      ))}
                   </select>
               </div>
            </div>
          </div>
        </div>
        <button 
           onClick={() => { setDrugList(['', '']); setShowDrugModal(true); }}
           className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 font-medium transition-colors flex items-center"
        >
            <Sparkles size={14} className="mr-1.5" />
            Drug Checker
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] md:max-w-[70%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                msg.role === 'user' ? 'bg-slate-200' : 'bg-blue-100'
              }`}>
                {msg.role === 'user' ? <User size={16} className="text-slate-600" /> : <Bot size={16} className="text-blue-600" />}
              </div>
              
              <div className="flex flex-col gap-1">
                  <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  } ${msg.isError ? 'bg-red-50 text-red-600 border-red-100' : ''}`}>
                    {msg.text}
                  </div>
                  {msg.role === 'model' && !msg.isError && selectedPatientId && (
                      <div className="flex justify-end">
                          <button 
                             onClick={() => handleSaveNote(msg.text)}
                             className="text-[10px] text-slate-500 hover:text-blue-600 flex items-center bg-white px-2 py-1 rounded border border-slate-200 shadow-sm hover:shadow transition-all"
                          >
                              <Save size={10} className="mr-1" />
                              Save to Record
                          </button>
                      </div>
                  )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mt-1">
                <Loader2 size={16} className="text-blue-600 animate-spin" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        {messages.length < 3 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {quickPrompts.map((p, i) => (
              <button 
                key={i} 
                onClick={() => { setInput(p.text); }}
                className="flex-shrink-0 flex items-center space-x-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 text-xs px-3 py-2 rounded-full border border-slate-200 transition-all"
              >
                <p.icon size={14} />
                <span>{p.text.substring(0, 30)}...</span>
              </button>
            ))}
          </div>
        )}
        
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={selectedPatientId ? `Ask about patient...` : "Ask MedCore AI about symptoms, drugs, or patients..."}
            disabled={isLoading}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-md"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          AI responses can be inaccurate. Always verify with a medical professional.
        </p>
      </div>

       {/* Drug Interaction Modal */}
       {showDrugModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in relative">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles className="text-indigo-500" size={20} />
                        Drug Interaction Checker
                    </h3>
                    <p className="text-sm text-slate-500">Enter medications to analyze potential interactions.</p>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4 pr-2">
                    {drugList.map((drug, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input 
                                type="text"
                                value={drug}
                                onChange={(e) => handleDrugInput(idx, e.target.value)}
                                placeholder={`Drug Name #${idx + 1}`}
                                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            {drugList.length > 2 && (
                                <button 
                                    onClick={() => removeDrugField(idx)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <AlertTriangle size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button 
                        onClick={addDrugField}
                        className="text-xs text-indigo-600 font-medium hover:underline flex items-center"
                    >
                        <Plus size={12} className="mr-1" /> Add another drug
                    </button>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button 
                        onClick={() => setShowDrugModal(false)}
                        className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={submitDrugCheck}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-lg shadow-indigo-600/20"
                    >
                        Check Interactions
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Helper Plus Icon for Add Drug - needs to be imported if used */}
      <div className="hidden"><User /></div> 
    </div>
  );
};

// Import Plus icon locally for the modal
const Plus = ({ size, className }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

export default AiAssistant;