import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { format, addDays } from 'date-fns';
import SupabaseTest from './SupabaseTest';
import SignIn from './SignIn';
import RegisterAdmin from './RegisterAdmin';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showConnectionTest, setShowConnectionTest] = useState(true);
  const [showRegisterAdmin, setShowRegisterAdmin] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Not tested');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bookName: '',
    glNo: '',
    dateTaken: '',
    dueDate: ''
  });
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }
    };
    
    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      testConnection();
      loadEntries();
    }
  }, [user]);

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
      } else if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSignIn = (user) => {
    setUser(user);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  const testConnection = async () => {
    setConnectionStatus('Testing...');
    try {
      const { data, error } = await supabase
        .from('borrowings')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      setConnectionStatus('✅ Connected Successfully!');
      showNotification('Supabase connection successful!', 'success');
    } catch (error) {
      setConnectionStatus(`❌ Connection Failed: ${error.message}`);
      showNotification(`Connection failed: ${error.message}`, 'error');
    }
  };

  const loadEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('borrowings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      showNotification(`Error loading entries: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate due date when date taken changes
    if (name === 'dateTaken' && value) {
      const dueDate = addDays(new Date(value), 14);
      setFormData(prev => ({
        ...prev,
        dueDate: format(dueDate, 'yyyy-MM-dd')
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for unique GL No
    const { data: existing } = await supabase
      .from('borrowings')
      .select('*')
      .eq('gl_no', formData.glNo)
      .single();

    if (existing) {
      showNotification('GL No already exists!', 'error');
      return;
    }

    try {
      // Map form data to database column names
      const insertData = {
        name: formData.name,
        phone: formData.phone,
        book_name: formData.bookName,
        gl_no: formData.glNo,
        date_taken: formData.dateTaken,
        due_date: formData.dueDate
      };

      const { error } = await supabase
        .from('borrowings')
        .insert([insertData]);

      if (error) throw error;

      showNotification('Book borrowing recorded successfully!', 'success');
      setFormData({
        name: '',
        phone: '',
        bookName: '',
        glNo: '',
        dateTaken: '',
        dueDate: ''
      });
      loadEntries();
    } catch (error) {
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      name: entry.name,
      phone: entry.phone,
      bookName: entry.book_name,
      glNo: entry.gl_no,
      dateTaken: entry.date_taken,
      dueDate: entry.due_date
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('borrowings')
        .update({
          name: formData.name,
          phone: formData.phone,
          book_name: formData.bookName,
          gl_no: formData.glNo,
          date_taken: formData.dateTaken,
          due_date: formData.dueDate
        })
        .eq('id', editingEntry.id);

      if (error) throw error;

      showNotification('Entry updated successfully!', 'success');
      setEditingEntry(null);
      setFormData({
        name: '',
        phone: '',
        bookName: '',
        glNo: '',
        dateTaken: '',
        dueDate: ''
      });
      loadEntries();
    } catch (error) {
      showNotification(`Error updating entry: ${error.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const { error } = await supabase
          .from('borrowings')
          .delete()
          .eq('id', id);

        if (error) throw error;

        showNotification('Entry deleted successfully!', 'success');
        loadEntries();
      } catch (error) {
        showNotification(`Error deleting entry: ${error.message}`, 'error');
      }
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="App">
      {!user ? (
        <SignIn onSignIn={handleSignIn} />
      ) : showRegisterAdmin ? (
        <RegisterAdmin onBack={() => setShowRegisterAdmin(false)} />
      ) : showConnectionTest ? (
        <div>
          <header className="App-header">
            <h1>📚 IRB Library - Connection Test</h1>
            <div className="header-buttons">
              <button 
                onClick={() => setShowConnectionTest(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                🏠 Go to Main App
              </button>
              {userProfile?.role === 'admin' && (
                <button 
                  onClick={() => setShowRegisterAdmin(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}
                >
                  👤 Create User
                </button>
              )}
              <button 
                onClick={handleSignOut}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          </header>
          <SupabaseTest />
        </div>
      ) : (
        <>
          <header className="App-header">
            <h1>📚 IRB Library</h1>
            <div className="header-buttons">
              <button onClick={testConnection} className="test-btn">
                🔌 Test Connection
              </button>
              <button 
                onClick={() => setShowConnectionTest(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                🔧 Connection Test
              </button>
              {userProfile?.role === 'admin' && (
                <button 
                  onClick={() => setShowRegisterAdmin(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}
                >
                  👤 Create User
                </button>
              )}
              <button 
                onClick={handleSignOut}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          </header>

          {userProfile && (
            <div className="user-info">
              <span>Welcome, {userProfile.email} ({userProfile.role})</span>
            </div>
          )}

          <div className={`connection-status ${connectionStatus.includes('✅') ? 'success' : 'error'}`}>
            <span>{connectionStatus}</span>
          </div>

          <div className="container">
            <div className="form-section">
              <h2>{editingEntry ? 'Edit Entry' : 'Add New Borrowing'}</h2>
              <form onSubmit={editingEntry ? handleUpdate : handleSubmit}>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Book Name *</label>
                  <input
                    type="text"
                    name="bookName"
                    value={formData.bookName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>GL No *</label>
                  <input
                    type="text"
                    name="glNo"
                    value={formData.glNo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date Taken *</label>
                  <input
                    type="date"
                    name="dateTaken"
                    value={formData.dateTaken}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Due Date (Auto-calculated)</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    readOnly
                    className="readonly"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    {editingEntry ? 'Update' : 'Submit'}
                  </button>
                  {editingEntry && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingEntry(null);
                        setFormData({
                          name: '',
                          phone: '',
                          bookName: '',
                          glNo: '',
                          dateTaken: '',
                          dueDate: ''
                        });
                      }}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="entries-section">
              <h2>All Entries</h2>
              {loading ? (
                <div className="loading">Loading...</div>
              ) : entries.length === 0 ? (
                <div className="no-entries">No entries found</div>
              ) : (
                <div className="entries-list">
                  {entries.map((entry) => (
                    <div key={entry.id} className="entry-card">
                      <div className="entry-header">
                        <h3>{entry.name}</h3>
                        <div className="entry-actions">
                          <button 
                            onClick={() => handleEdit(entry)}
                            className="edit-btn"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(entry.id)}
                            className="delete-btn"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                      <div className="entry-details">
                        <p><strong>Book:</strong> {entry.book_name}</p>
                        <p><strong>Phone:</strong> {entry.phone}</p>
                        <p><strong>GL No:</strong> {entry.gl_no}</p>
                        <p className={isOverdue(entry.due_date) ? 'overdue' : ''}>
                          <strong>Due:</strong> {format(new Date(entry.due_date), 'yyyy-MM-dd')}
                          {isOverdue(entry.due_date) && ' (OVERDUE!)'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;