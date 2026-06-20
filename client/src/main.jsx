import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '16px',
          background: '#F5F0E8', color: '#0A0A0A', padding: '24px',
          textAlign: 'center', fontFamily: 'sans-serif'
        }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>Nico Portfolio</p>
          <p style={{ color: '#9A9487' }}>頁面載入失敗，請重新整理</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#0A0A0A', color: '#F5F0E8', border: 'none',
              padding: '10px 24px', cursor: 'pointer', fontSize: '14px'
            }}
          >
            重新整理
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
