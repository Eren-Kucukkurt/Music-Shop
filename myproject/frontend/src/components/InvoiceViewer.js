import React, { useState } from 'react';
import axios from 'axios';
import { Typography } from '@mui/material';
import './InvoiceViewer.css';

const InvoiceViewer = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false); // State for loading message

  const fetchInvoices = async () => {
    setLoading(true); // Show loading message
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/cart/fetch-invoices/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { start_date: startDate, end_date: endDate },
      });
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false); // Hide loading message
    }
  };

  const fetchInvoiceById = async () => {
    if (!orderId) return;
    setLoading(true); // Show loading message
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await axios.get(`http://localhost:8000/api/cart/fetch-invoice/${orderId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices([response.data]);
    } catch (error) {
      console.error('Error fetching invoice by ID:', error);
    } finally {
      setLoading(false); // Hide loading message
    }
  };

  const fetchAllInvoices = async () => {
    setLoading(true); // Show loading message
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/cart/fetch-invoices/', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start_date: '1900-01-01', // Start from an arbitrarily early date
          end_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        },
      });
      //console.log(new Date().toISOString().split('T')[0]);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching all invoices:', error);
    } finally {
      setLoading(false); // Hide loading message
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await axios.get(`http://localhost:8000/api/cart/download-invoice-pdf/${orderId}/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const printInvoice = (invoice) => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html>
        <head>
          <title>Invoice #${invoice.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1, h2, h3 {
              margin-bottom: 10px;
            }
            ul {
              list-style-type: none;
              padding: 0;
            }
          </style>
        </head>
        <body>
          <h1>Invoice #${invoice.id}</h1>
          <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleString()}</p>
          <p><strong>Status:</strong> ${invoice.status}</p>

          <h3>Items Purchased:</h3>
          <ul>
            ${invoice.items
              .map(
                (item) =>
                  `<li>${item.quantity} x ${item.product_name} @ $${new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(parseFloat(item.price/item.quantity))} each</li>`
              )
              .join('')}
          </ul>

          <h3>Total: $${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(parseFloat(invoice.total_price))}</h3>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="invoice-viewer-container">
      <h1>Invoice Viewer</h1>
      <div className="filters-container">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="date-input"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="date-input"
        />
        <button className="primary-button" onClick={fetchInvoices}>
          Fetch Invoices
        </button>
        <button className="primary-button" onClick={fetchAllInvoices}>
          View All Invoices
        </button>
      </div>

      <div className="filters-container">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="search-input"
          placeholder="Search by Order ID"
        />
        <button className="primary-button" onClick={fetchInvoiceById}>
          Search Invoice
        </button>
      </div>

      {loading && <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 3 }}>
    Fetching invoices please wait...
  </Typography>} {/* Loading Message */}

      {invoices.length > 0 && (
        <div className="invoices-container">
          <h2>Invoices</h2>
          <ul className="invoice-list">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="invoice-item">
                <span>
                  Invoice #{invoice.id} - ${new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(parseFloat(invoice.total_price))}
                </span>
                <div className="invoice-actions">
                  <button className="secondary-button" onClick={() => downloadInvoice(invoice.id)}>
                    Download PDF
                  </button>
                  <button className="secondary-button" onClick={() => printInvoice(invoice)}>
                    Print
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InvoiceViewer;
