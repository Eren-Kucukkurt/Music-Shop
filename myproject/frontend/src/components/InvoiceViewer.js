import React, { useState } from 'react';
import axios from 'axios';

const InvoiceViewer = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [orderId, setOrderId] = useState('');

  const fetchInvoices = async () => {
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/cart/fetch-invoices/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { start_date: startDate, end_date: endDate },
      });
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchInvoiceById = async () => {
    if (!orderId) return;
    try {
      console.log('Fetching invoice by ID:', orderId);  
      const token = sessionStorage.getItem('access_token');
      const response = await axios.get(`http://localhost:8000/api/cart/fetch-invoice/${orderId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched invoice:', response.data);
      setInvoices([response.data]); // Overwrite invoices to show only the searched one
    } catch (error) {
      console.error('Error fetching invoice by ID:', error);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await axios.get(`http://localhost:8000/api/cart/download-invoice-pdf/${orderId}/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Important for file downloads
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
                  `<li>${item.quantity} x ${item.product_name} @ $${parseFloat(item.price).toFixed(2)} each</li>`
              )
              .join('')}
          </ul>

          <h3>Total: $${parseFloat(invoice.total_price).toFixed(2)}</h3>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <h1>Invoice Viewer</h1>
      <div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
        />
        <button onClick={fetchInvoices}>Fetch Invoices</button>
      </div>

      <div>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Search by Order ID"
        />
        <button onClick={fetchInvoiceById}>Search Invoice</button>
      </div>

      {invoices.length > 0 && (
        <div>
          <h2>Invoices</h2>
          <ul>
            {invoices.map((invoice) => (
              <li key={invoice.id}>
                Invoice #{invoice.id} - ${invoice.total_price}
                <button onClick={() => downloadInvoice(invoice.id)}>Download PDF</button>
                <button onClick={() => printInvoice(invoice)}>Print</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InvoiceViewer;
