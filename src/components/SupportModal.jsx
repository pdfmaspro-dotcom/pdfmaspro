import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || ''
const UPI_ID          = import.meta.env.VITE_UPI_ID          || ''
const UPI_LINK        = UPI_ID ? `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent('PDF Master Pro')}&cu=INR&tn=${encodeURIComponent('Support PDF Master Pro')}` : ''
const PAYPAL_USERNAME = import.meta.env.VITE_PAYPAL_USERNAME  || 'Maspropdf'

function SupportModal({ onClose }) {
  const [amount, setAmount] = useState(99)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('upi')

  const presets = [49, 99, 199, 499]

  const openRazorpay = () => {
    if (!RAZORPAY_KEY_ID) { alert('Card payments are not available right now. Please use the UPI QR or PayPal option.'); return }
    if (!window.Razorpay) { alert('Payment loading, please try again.'); return }
    setLoading(true)
    const rzp = new window.Razorpay({
      key: RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: 'INR',
      name: 'PDF Master Pro',
      description: 'Support free PDF tools',
      image: '/favicon.svg',
      handler: (res) => {
        setLoading(false)
        alert(`Thank you! ❤️\nPayment ID: ${res.razorpay_payment_id}`)
        onClose()
      },
      prefill: { name: '', email: '' },
      theme: { color: '#6366f1' },
      modal: { ondismiss: () => setLoading(false) }
    })
    rzp.open()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">❤️ Support PDF Master Pro</h2>
            <p className="text-gray-400 text-xs mt-0.5">Help keep all 32 tools free forever</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none ml-4">×</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { id: 'upi',      label: '📱 UPI QR' },
            { id: 'razorpay', label: '💳 Card / Netbanking' },
            { id: 'paypal',   label: '🌐 PayPal' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 text-xs rounded-lg border transition-all ${
                tab === t.id
                  ? 'border-indigo-500 bg-indigo-900/30 text-indigo-300 font-semibold'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Razorpay Tab */}
        {tab === 'razorpay' && (
          <>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {presets.map(p => (
                <button key={p} onClick={() => setAmount(p)}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                    amount === p
                      ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                      : 'border-gray-700 text-gray-300 hover:border-gray-500'
                  }`}>
                  ₹{p}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-4 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <span className="text-gray-400 text-sm font-medium">₹</span>
              <input type="number" min="10" value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="flex-1 bg-transparent text-sm focus:outline-none text-white"
                placeholder="Custom amount" />
            </div>
            <button onClick={openRazorpay} disabled={loading || amount < 10}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-all">
              {loading ? 'Opening payment...' : `Pay ₹${amount} via Razorpay`}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">Cards · Netbanking · UPI · Wallets</p>
            <p className="text-[11px] text-gray-500 text-center mt-2 leading-relaxed">
              🔒 Razorpay requires a mobile number to verify the payment. PDF Master Pro never sees or stores it.
            </p>
          </>
        )}

        {/* UPI QR Tab */}
        {tab === 'upi' && (
          <div className="text-center">
            <div className="bg-white p-2 rounded-xl inline-block mb-3 shadow-lg">
              <img src="/upi-qr.png" alt="UPI QR Code to support PDF Master Pro"
                className="w-52 h-auto object-contain"
                onError={e => {
                  e.target.style.display = 'none'
                  document.getElementById('upi-fallback').style.display = 'flex'
                }} />
              <div id="upi-fallback" style={{ display: 'none' }}
                className="w-52 h-52 bg-gray-100 rounded-lg items-center justify-center text-gray-500 text-xs text-center p-4">
                QR could not load. Please use the Card or PayPal tab.
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-2 font-medium">Scan with any UPI app</p>
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 inline-block mb-3">
              <p className="text-xs text-gray-400">Paying to</p>
              <p className="text-indigo-300 font-semibold text-sm">PDF Master Pro · pdfmaspro.com</p>
            </div>
            {UPI_LINK && (
              <div className="mb-3">
                <a href={UPI_LINK}
                  className="inline-block sm:hidden bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                  Pay with UPI app →
                </a>
              </div>
            )}
            <p className="text-xs text-gray-500">No mobile number needed · PhonePe · GPay · Paytm · BHIM</p>
          </div>
        )}

        {/* PayPal Tab */}
        {tab === 'paypal' && (
          <div className="text-center py-2">
            <div className="text-5xl mb-4">🌐</div>
            <p className="text-sm text-gray-300 mb-1 font-medium">Support via PayPal</p>
            <p className="text-xs text-gray-500 mb-6">International payments · Any currency · One-time support</p>
            <a href={`https://paypal.me/${PAYPAL_USERNAME}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0070ba] hover:bg-[#005ea6] text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg">
              Support via PayPal →
            </a>
            <p className="text-xs text-gray-500 mt-4">Opens PayPal in a new tab</p>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-gray-800 text-center">
          <Link to="/blog/where-your-support-goes" onClick={onClose}
            className="text-xs text-indigo-400 hover:underline">
            Where does your support go? →
          </Link>
        </div>

      </div>
    </div>
  )
}

export default SupportModal
