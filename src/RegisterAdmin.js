import React, { useState } from 'react';
import { supabase } from './supabase';
import './RegisterAdmin.css';

const RegisterAdmin = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Create the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(`Error creating user: ${error.message}`);
        setMessageType('error');
        return;
      }

      if (data && data.user) {
        // Assign role in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
            user_id: data.user.id, 
            role: role,
            email: email,
            created_at: new Date().toISOString()
          }]);

        if (profileError) {
          setMessage(`User created but error assigning role: ${profileError.message}`);
          setMessageType('warning');
        } else {
          setMessage(`User created and assigned ${role} role successfully!`);
          setMessageType('success');
          // Clear form
          setEmail('');
          setPassword('');
          setRole('admin');
        }
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-admin-container">
      <div className="register-admin-card">
        <div className="register-admin-header">
          <h1>Create New User</h1>
          <p>Register a new user with role assignment</p>
        </div>
        
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="register-admin-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min 6 characters)"
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="admin">Admin</option>
              <option value="librarian">Librarian</option>
              <option value="user">User</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="register-button"
              disabled={loading}
            >
              {loading ? 'Creating User...' : 'Create User'}
            </button>
            
            {onBack && (
              <button 
                type="button" 
                onClick={onBack}
                className="back-button"
              >
                ← Back to App
              </button>
            )}
          </div>
        </form>
        
        <div className="register-admin-footer">
          <p>This will create a new user account with the specified role</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterAdmin; 