import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    runConnectionTests();
  }, []);

  const runConnectionTests = async () => {
    const results = [];
    
    try {
      // Test 1: Basic connection
      results.push('🔍 Testing basic connection...');
      const { data, error } = await supabase
        .from('borrowings')
        .select('count')
        .limit(1);
      
      if (error) {
        results.push(`❌ Connection failed: ${error.message}`);
        setConnectionStatus('❌ Connection Failed');
      } else {
        results.push('✅ Basic connection successful!');
        setConnectionStatus('✅ Connected Successfully!');
      }

      // Test 2: Check if table exists
      results.push('🔍 Checking if borrowings table exists...');
      const { data: tableData, error: tableError } = await supabase
        .from('borrowings')
        .select('*')
        .limit(1);
      
      if (tableError) {
        results.push(`❌ Table error: ${tableError.message}`);
      } else {
        results.push(`✅ Table exists! Found ${tableData?.length || 0} records`);
      }

      // Test 3: Test insert (will be rolled back)
      results.push('🔍 Testing insert capability...');
      const testData = {
        name: 'Test User',
        phone: '1234567890',
        book_name: 'Test Book',
        gl_no: `TEST-${Date.now()}`,
        date_taken: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const { error: insertError } = await supabase
        .from('borrowings')
        .insert([testData]);

      if (insertError) {
        results.push(`❌ Insert test failed: ${insertError.message}`);
      } else {
        results.push('✅ Insert test successful!');
        
        // Clean up test data
        await supabase
          .from('borrowings')
          .delete()
          .eq('gl_no', testData.gl_no);
        results.push('🧹 Test data cleaned up');
      }

    } catch (error) {
      results.push(`❌ Unexpected error: ${error.message}`);
      setConnectionStatus('❌ Connection Failed');
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const getConnectionInfo = () => {
    const url = process.env.REACT_APP_SUPABASE_URL || 'https://eiposhexdebpdkfmdrxd.supabase.co';
    const key = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcG9zaGV4ZGVicGRrZm1kcnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTM0MDcsImV4cCI6MjA2NjY4OTQwN30.l6AXl3MJDyP8vqTopJcxqyejlBWbTWKuat8rSv1rypw';
    
    return {
      url: url,
      keyPrefix: key.substring(0, 20) + '...',
      hasEnvVars: !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY)
    };
  };

  const connectionInfo = getConnectionInfo();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔌 Supabase Connection Test</h2>
      
      <div style={{ 
        padding: '15px', 
        margin: '20px 0', 
        borderRadius: '8px',
        backgroundColor: connectionStatus.includes('✅') ? '#d4edda' : '#f8d7da',
        border: `1px solid ${connectionStatus.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        <strong>Status: {connectionStatus}</strong>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Connection Details:</h3>
        <ul>
          <li><strong>URL:</strong> {connectionInfo.url}</li>
          <li><strong>Key:</strong> {connectionInfo.keyPrefix}</li>
          <li><strong>Environment Variables:</strong> {connectionInfo.hasEnvVars ? '✅ Set' : '⚠️ Using fallback values'}</li>
        </ul>
      </div>

      <button 
        onClick={runConnectionTests}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {isLoading ? 'Testing...' : '🔄 Run Tests Again'}
      </button>

      <div>
        <h3>Test Results:</h3>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}>
          {testResults.map((result, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {result}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SupabaseTest; 