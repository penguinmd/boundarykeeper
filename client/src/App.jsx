import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🏔️ Boundary Keeper
          </h1>
          <p className="text-gray-600 mt-1">
            Transform emotional messages into neutral, effective responses
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="card">
          <p className="text-gray-600">Frontend setup complete! Ready to build components.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
