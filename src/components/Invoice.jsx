import html2pdf from "html2pdf.js";

export default function Invoice({ order }) {
  const downloadPDF = () => {
    const element = document.getElementById("invoice");
    html2pdf().from(element).save(`Invoice-${order.id}.pdf`);
  };

  return (
    <div className="invoice-shell">
      <div className="invoice-toolbar">
        <div>
          <span className="page-kicker">Invoice</span>
          <h2>Order #{order.id}</h2>
        </div>
        <button className="surface-primary-btn" onClick={downloadPDF}>
          Download PDF
        </button>
      </div>

      <div id="invoice" className="invoice-card">
        <div className="invoice-header">
          <div>
            <h3>Friends Auto Spares</h3>
            <p>Bike parts and service essentials</p>
          </div>
          <div className="invoice-header-meta">
            <strong>Invoice</strong>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="invoice-meta-grid">
          <div>
            <span>Invoice number</span>
            <strong>#{order.id}</strong>
          </div>
          <div>
            <span>Customer</span>
            <strong>{order.user}</strong>
          </div>
          <div>
            <span>Payment</span>
            <strong>{order.method}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{order.status || "Confirmed"}</strong>
          </div>
        </div>

        <div className="invoice-table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th align="left">Product</th>
                <th align="center">Qty</th>
                <th align="right">Price</th>
                <th align="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={`${item.name}-${index}`}>
                  <td>{item.name}</td>
                  <td align="center">{item.qty || 1}</td>
                  <td align="right">Rs. {item.price}</td>
                  <td align="right">Rs. {item.price * (item.qty || 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-total-row">
          <span>Grand total</span>
          <strong>Rs. {order.total}</strong>
        </div>

        <div className="invoice-address-block">
          <h4>Shipping address</h4>
          <p>{order.address}</p>
          <p>
            {order.city} - {order.pincode}
          </p>
        </div>

        <p className="invoice-note">
          Thank you for shopping with Friends Auto Spares.
        </p>
      </div>
    </div>
  );
}
