import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { format, addDays } from 'date-fns';
import './App.css';

function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Not tested');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bookName: '',
    glNo: '',
    dateTaken: '',
    dueDate: ''
  });
  const [editingEntry, setEditingEntry] = useState(null);
  const [bookSuggestions, setBookSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  useEffect(() => {
    testConnection();
    loadEntries();
  }, []);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showNotification('Please enter a book name to search', 'error');
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const { data, error } = await supabase
        .from('borrowings')
        .select('*')
        .ilike('book_name', `%${searchQuery.trim()}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSearchResults(data || []);
      
      if (data.length === 0) {
        showNotification('No books found with that name', 'warning');
      } else {
        showNotification(`Found ${data.length} book(s)`, 'success');
      }
    } catch (error) {
      showNotification(`Search error: ${error.message}`, 'error');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const fetchBookSuggestions = async (query) => {
    if (!query.trim()) {
      setBookSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSuggestionLoading(true);
    try {
      const { data, error } = await supabase
        .from('library')
        .select('NAME_OF_BOOK')
        .ilike('NAME_OF_BOOK', `%${query.trim()}%`)
        .limit(10);
      if (error) throw error;
      setBookSuggestions(data ? data.map(row => row['NAME_OF_BOOK']) : []);
      setShowSuggestions(true);
    } catch (error) {
      setBookSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSuggestionLoading(false);
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
    // Fetch suggestions for bookName
    if (name === 'bookName') {
      fetchBookSuggestions(value);
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
      <>
        <header className="App-header">
          <h1>📚 IRB Library</h1>
          <div className="header-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by book name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="search-btn"
              >
                {isSearching ? '🔍 Searching...' : '🔍 Search'}
              </button>
              {showSearchResults && (
                <button 
                  onClick={clearSearch}
                  className="clear-search-btn"
                >
                  ✕ Clear
                </button>
              )}
            </div>
            <div className="header-buttons">
              <button onClick={testConnection} className="test-btn">
                🔌 Test Connection
              </button>
            </div>
          </div>
        </header>

        <div className={`connection-status ${connectionStatus.includes('✅') ? 'success' : 'error'}`}>
          <span>{connectionStatus}</span>
        </div>

        {showSearchResults && (
          <div className="search-results-section">
            <h2>🔍 Search Results for "{searchQuery}"</h2>
            {isSearching ? (
              <div className="loading">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="no-results">No books found with that name</div>
            ) : (
              <div className="search-results">
                <div className="results-summary">
                  Found {searchResults.length} book(s)
                </div>
                <div className="entries-list">
                  {searchResults.map((entry) => (
                    <div key={entry.id} className="entry-card search-result-card">
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
                        <p><strong>Date Taken:</strong> {format(new Date(entry.date_taken), 'yyyy-MM-dd')}</p>
                        <p className={isOverdue(entry.due_date) ? 'overdue' : ''}>
                          <strong>Due:</strong> {format(new Date(entry.due_date), 'yyyy-MM-dd')}
                          {isOverdue(entry.due_date) && ' (OVERDUE!)'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
                  onFocus={() => formData.bookName && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  autoComplete="off"
                  required
                />
                {showSuggestions && bookSuggestions.length > 0 && (
                  <ul className="suggestions-dropdown">
                    {suggestionLoading ? (
                      <li className="loading">Loading...</li>
                    ) : (
                      bookSuggestions.map((suggestion, idx) => (
                        <li
                          key={idx}
                          onMouseDown={() => {
                            setFormData(prev => ({ ...prev, bookName: suggestion }));
                            setShowSuggestions(false);
                          }}
                          className="suggestion-item"
                        >
                          {suggestion}
                        </li>
                      ))
                    )}
                  </ul>
                )}
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
    </div>
  );
}

export default App;