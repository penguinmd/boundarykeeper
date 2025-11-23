#!/usr/bin/env node

/**
 * Gemini API Test Script
 * Tests if your Gemini API key is working correctly
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('\n🔍 Testing Gemini API Connection...\n');

  // Check if API key is set
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    console.log('\nTo fix this:');
    console.log('1. Go to https://makersuite.google.com/app/apikey');
    console.log('2. Create an API key if you haven\'t already');
    console.log('3. Add this line to server/.env:');
    console.log('   GEMINI_API_KEY=your-api-key-here\n');
    process.exit(1);
  }

  console.log('✅ API key found in environment');
  console.log(`   Key starts with: ${apiKey.substring(0, 10)}...`);

  // Test with different models
  const modelsToTest = [
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash'
  ];

  for (const modelName of modelsToTest) {
    console.log(`\n📝 Testing model: ${modelName}`);
    console.log('─'.repeat(50));

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = "Say 'Hello! API is working.' in exactly those words.";

      console.log('   Sending test prompt...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`   ✅ Success!`);
      console.log(`   Response: ${text.trim()}`);

      // Test JSON extraction capability
      const jsonPrompt = 'Return this exact JSON: {"status": "working", "test": true}';
      console.log('   Testing JSON response...');
      const jsonResult = await model.generateContent(jsonPrompt);
      const jsonResponse = await jsonResult.response;
      const jsonText = jsonResponse.text();

      console.log(`   JSON test response: ${jsonText.trim()}`);

    } catch (error) {
      console.error(`   ❌ Error with ${modelName}:`);
      console.error(`   ${error.message}`);

      if (error.message.includes('API_KEY_INVALID')) {
        console.log('\n⚠️  Your API key appears to be invalid.');
        console.log('   Please check:');
        console.log('   1. The key is copied correctly (no extra spaces)');
        console.log('   2. The API key is enabled in Google AI Studio');
        console.log('   3. You have billing enabled (if required)');
      }

      if (error.message.includes('models/')) {
        console.log(`\n⚠️  Model "${modelName}" may not be available.`);
        console.log('   This could mean:');
        console.log('   1. The model name has changed');
        console.log('   2. Your API key doesn\'t have access to this model');
        console.log('   3. The model requires special access');
      }
    }
  }

  console.log('\n✨ Test complete!\n');
}

// Run the test
testGeminiAPI().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
