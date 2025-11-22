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
        const successCount = data.results.filter(r => !r.error).length;
        const errorCount = data.results.filter(r => r.error).length;

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
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                🏔️ Boundary Keeper
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Transform emotional messages into neutral, effective responses
              </p>
            </div>
            <InfoTooltip />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <ConversationHistory
          key={historyKey}
          onSelectConversation={handleSelectConversation}
        />

        <div className="mb-6">
          <ModelSelector
            selectedModels={selectedModels}
            onModelChange={setSelectedModels}
            disabled={loading}
          />
        </div>

        <TextInput onAnalyze={handleAnalyze} loading={loading} />
        <AnalysisResults result={result} />
      </main>

      <Footer />
    </div>
  );
}

export default App;
