# 📚 Lovable Library - React.js Version

A modern React.js application for managing book borrowings with Supabase backend integration.

## ✨ Features

- 📖 **Add new book borrowings** with borrower details
- 📋 **View all entries** in a clean, organized list
- ✏️ **Edit existing entries** with inline form editing
- 🗑️ **Delete entries** with confirmation
- ⏰ **Auto-calculate due dates** (2 weeks from borrow date)
- ⚠️ **Overdue book highlighting** with visual indicators
- 🔌 **Real-time Supabase connection** with status indicator
- 📱 **Responsive design** for all devices
- 🎨 **Modern UI** with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd react-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

## 🛠️ Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## 🌐 Deploy to Netlify

### Method 1: Drag & Drop (Easiest)
1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag and drop the `build` folder
4. Your app is live!

### Method 2: Git Integration
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `build`

## 🔧 Environment Variables

The app uses hardcoded Supabase credentials for simplicity. For production, consider using environment variables:

Create a `.env` file:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Database Schema

The app connects to a Supabase table with this structure:

```sql
CREATE TABLE borrowings (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  book_name TEXT NOT NULL,
  gl_no TEXT UNIQUE NOT NULL,
  date_taken DATE NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Key Components

- **App.js**: Main application component with all functionality
- **supabase.js**: Supabase client configuration
- **App.css**: Comprehensive styling with responsive design

## 🔄 API Functions

- `testConnection()`: Test Supabase connection
- `loadEntries()`: Fetch all borrowing entries
- `handleSubmit()`: Add new borrowing entry
- `handleEdit()`: Edit existing entry
- `handleUpdate()`: Update entry in database
- `handleDelete()`: Delete entry with confirmation

## 🎨 Styling Features

- **Modern gradient design** with purple theme
- **Smooth hover animations** and transitions
- **Responsive grid layout** for desktop and mobile
- **Toast notifications** for user feedback
- **Loading states** with spinner animations
- **Overdue book highlighting** in red

## 📱 Responsive Design

- **Desktop**: Two-column layout (form + entries)
- **Tablet**: Stacked layout with optimized spacing
- **Mobile**: Single column with touch-friendly buttons

## 🚀 Performance Features

- **Optimized React hooks** for state management
- **Efficient re-rendering** with proper dependencies
- **Lazy loading** of components
- **Minified production build**

## 🔒 Security

- **Supabase Row Level Security (RLS)** enabled
- **Input validation** on all forms
- **SQL injection protection** via Supabase client
- **XSS protection** with React's built-in escaping

## 🐛 Troubleshooting

### Connection Issues
- Check Supabase credentials in `src/supabase.js`
- Verify the `borrowings` table exists in your Supabase project
- Ensure RLS policies allow read/write operations

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ using React.js and Supabase**