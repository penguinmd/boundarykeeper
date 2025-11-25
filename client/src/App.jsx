import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import TextInput from './components/TextInput';
import AnalysisResults from './components/AnalysisResults';
import ConversationHistory from './components/ConversationHistory';
import InfoTooltip from './components/InfoTooltip';
import Footer from './components/Footer';
import ModelSelector from './components/ModelSelector';
import { analyzeText } from './services/api';
import { saveConversation } from './utils/storage';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [selectedModels, setSelectedModels] = useState([]);

  const handleAnalyze = async (text) => {
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeText(text, selectedModels.length > 0 ? selectedModels : null);

      // Validate response structure (handle both old and new format)
      const hasResults = data.results && Array.isArray(data.results);
      if (!hasResults && (!data.greyRock || !data.yellowRock)) {
        throw new Error('Invalid response from server');
      }

      setResult(data);
      saveConversation(data);
      setHistoryKey(prev => prev + 1); // Trigger history reload

      if (hasResults) {
        const errorCount = data.results.filter(r => r.error).length;
        const successCount = data.results.length - errorCount;

        if (errorCount > 0) {
          toast.success(`${successCount} model(s) completed, ${errorCount} failed`);
        } else {
          toast.success(`Analysis complete with ${successCount} model(s)!`);
        }
      } else {
        toast.success('Analysis complete!');
      }
    } catch (error) {
      console.error('Analysis error:', error);

      // More specific error messages
      if (error.message.includes('Network')) {
        toast.error('Network error. Please check your connection.');
      } else if (error.message.includes('timeout')) {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error(error.message || 'Analysis failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setResult(conversation);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toaster position="top-center" toastOptions={{
        className: '!rounded-xl !shadow-lg !text-slate-800',
        duration: 4000,
      }} />

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  Boundary Keeper
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Professional Communication Assistant
                </p>
              </div>
            </div>
            <InfoTooltip />
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8 sm:py-12 space-y-8">
        <div className="text-center space-y-2 mb-8">
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Transform emotional messages into neutral, effective responses that maintain your boundaries.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
          <div className="p-1">
            <TextInput onAnalyze={handleAnalyze} loading={loading} />
          </div>

          <div className="bg-slate-50/50 border-t border-slate-100 p-4">
            <ModelSelector
              selectedModels={selectedModels}
              onModelChange={setSelectedModels}
              disabled={loading}
            />
          </div>
        </div>

        <AnalysisResults result={result} />

        <div className="pt-8 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Recent History</h3>
          <ConversationHistory
            key={historyKey}
            onSelectConversation={handleSelectConversation}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
