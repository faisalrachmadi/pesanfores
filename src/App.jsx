import React, { useState } from 'react'

const App = () => {
  // Data menu kopi
  const coffeeMenu = [
    { id: 1, name: "Espresso", price: 15000, image: "☕" },
    { id: 2, name: "Cappuccino", price: 20000, image: "☕" },
    { id: 3, name: "Latte", price: 22000, image: "☕" },
    { id: 4, name: "Americano", price: 18000, image: "☕" },
    { id: 5, name: "Mocha", price: 25000, image: "☕" },
    { id: 6, name: "Macchiato", price: 23000, image: "☕" }
  ]

  // State untuk menyimpan jumlah pesanan setiap kopi
  const [order, setOrder] = useState({})
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fungsi untuk menambah jumlah pesanan
  const increaseQuantity = (coffeeId) => {
    setOrder(prev => ({
      ...prev,
      [coffeeId]: (prev[coffeeId] || 0) + 1
    }))
  }

  // Fungsi untuk mengurangi jumlah pesanan
  const decreaseQuantity = (coffeeId) => {
    setOrder(prev => ({
      ...prev,
      [coffeeId]: Math.max((prev[coffeeId] || 0) - 1, 0)
    }))
  }

  // Hitung total item dan total harga
  const calculateTotals = () => {
    let totalItems = 0
    let subtotal = 0
    const serviceFee = 2000

    Object.entries(order).forEach(([coffeeId, quantity]) => {
      if (quantity > 0) {
        const coffee = coffeeMenu.find(c => c.id === parseInt(coffeeId))
        if (coffee) {
          totalItems += quantity
          subtotal += quantity * coffee.price
        }
      }
    })

    const total = subtotal + serviceFee

    return { totalItems, subtotal, serviceFee, total }
  }

  const { totalItems, subtotal, serviceFee, total } = calculateTotals()

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (totalItems === 0) {
      alert('Silakan pilih minimal satu kopi untuk dipesan')
      return
    }

    if (!customerInfo.name || !customerInfo.phone) {
      alert('Silakan isi nama dan nomor telepon')
      return
    }

    setIsSubmitting(true)

    try {
      // Siapkan data untuk dikirim ke webhook n8n
      const orderData = {
        customer: customerInfo,
        items: coffeeMenu.map(coffee => ({
          ...coffee,
          quantity: order[coffee.id] || 0
        })).filter(item => item.quantity > 0),
        totals: calculateTotals(),
        timestamp: new Date().toISOString()
      }

      // Ganti URL dengan webhook n8n Anda
      const response = await fetch('https://your-n8n-webhook-url.com/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        alert('Pesanan berhasil dikirim! Terima kasih telah memesan.')
        // Reset form
        setOrder({})
        setCustomerInfo({ name: '', phone: '', address: '' })
      } else {
        throw new Error('Gagal mengirim pesanan')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat mengirim pesanan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>☕ Pesan Kopi</h1>
        <p>Pilih kopi favorit Anda dan pesan sekarang!</p>
      </div>

      <div className="menu-grid">
        {coffeeMenu.map(coffee => (
          <div key={coffee.id} className="coffee-card">
            <div className="coffee-image">
              {coffee.image}
            </div>
            <h3 className="coffee-name">{coffee.name}</h3>
            <p className="coffee-price">Rp {coffee.price.toLocaleString('id-ID')}</p>
            
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={() => decreaseQuantity(coffee.id)}
                disabled={(order[coffee.id] || 0) === 0}
              >
                -
              </button>
              
              <span className="quantity-display">
                {order[coffee.id] || 0}
              </span>
              
              <button 
                className="quantity-btn"
                onClick={() => increaseQuantity(coffee.id)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="summary">
        <h2>Ringkasan Pesanan</h2>
        
        <div className="summary-item">
          <span>Total Item:</span>
          <span>{totalItems} item</span>
        </div>
        
        <div className="summary-item">
          <span>Subtotal:</span>
          <span>Rp {subtotal.toLocaleString('id-ID')}</span>
        </div>
        
        <div className="summary-item">
          <span>Biaya Layanan:</span>
          <span>Rp {serviceFee.toLocaleString('id-ID')}</span>
        </div>
        
        <div className="summary-total">
          <span>Total:</span>
          <span>Rp {total.toLocaleString('id-ID')}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#495057' }}>Informasi Pelanggan</h3>
            
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({...prev, name: e.target.value}))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <input
                type="tel"
                placeholder="Nomor Telepon"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({...prev, phone: e.target.value}))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            
            <div>
              <textarea
                placeholder="Alamat Pengiriman (opsional)"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo(prev => ({...prev, address: e.target.value}))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={totalItems === 0 || isSubmitting}
          >
            {isSubmitting ? 'Mengirim Pesanan...' : 'Pesan Sekarang'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App