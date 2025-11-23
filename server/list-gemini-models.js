#!/usr/bin/env node

/**
 * List Available Gemini Models
 * Shows which models your API key can access
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  console.log('\n📋 Listing Available Gemini Models...\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // List all available models
    console.log('Fetching available models...\n');

    // Try to get model info
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.models || data.models.length === 0) {
      console.log('⚠️  No models found.');
      console.log('\nThis could mean:');
      console.log('1. Your API key doesn\'t have access to any models');
      console.log('2. You need to enable the Gemini API in Google Cloud Console');
      console.log('3. There may be billing or quota issues');
      return;
    }

    console.log(`Found ${data.models.length} models:\n`);
    console.log('─'.repeat(80));

    // Filter for generative models
    const generativeModels = data.models.filter(model =>
      model.supportedGenerationMethods?.includes('generateContent')
    );

    console.log('\n✨ Models that support text generation:\n');

    generativeModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName || 'N/A'}`);
      console.log(`   Description: ${model.description || 'N/A'}`);
      console.log(`   Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });

    console.log('─'.repeat(80));
    console.log('\n💡 To use a model, use the full name (e.g., "models/gemini-pro")');
    console.log('   or just the model name (e.g., "gemini-pro")\n');

    // Try testing with the first available model
    if (generativeModels.length > 0) {
      const firstModel = generativeModels[0];
      const modelName = firstModel.name.replace('models/', '');

      console.log(`\n🧪 Testing with first available model: ${modelName}\n`);

      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "Hello, API is working!" in exactly those words.');
        const response = await result.response;
        const text = response.text();

        console.log('✅ Test successful!');
        console.log(`Response: ${text.trim()}\n`);
      } catch (error) {
        console.error('❌ Test failed:', error.message);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.message.includes('403')) {
      console.log('\n⚠️  Access forbidden. Possible issues:');
      console.log('1. API key is invalid or revoked');
      console.log('2. Gemini API is not enabled for this project');
      console.log('3. Billing is not set up');
      console.log('\nTo fix:');
      console.log('- Go to https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
      console.log('- Enable the "Generative Language API"');
      console.log('- Ensure billing is enabled');
    }

    if (error.message.includes('401')) {
      console.log('\n⚠️  Authentication failed. Your API key may be invalid.');
      console.log('- Go to https://aistudio.google.com/app/apikey');
      console.log('- Create a new API key or verify the existing one');
    }
  }
}

listModels().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
