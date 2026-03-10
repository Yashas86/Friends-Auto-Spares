import html2pdf from "html2pdf.js";

export default function Invoice({ order }) {
  const downloadPDF = () => {
    const element = document.getElementById("invoice");
    html2pdf().from(element).save(`Invoice-${order.id}.pdf`);
  };

  return (
    <>
      <button
        onClick={downloadPDF}
        style={{
          marginBottom: 20,
          padding: "10px 18px",
          borderRadius: 8,
          border: "none",
          background: "#2563eb",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        📄 Download Invoice PDF
      </button>

      <div
        id="invoice"
        style={{
          maxWidth: 800,
          margin: "auto",
          padding: 24,
          background: "#fff",
          border: "1px solid #ddd",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>FRIENDS AUTO SPARES</h2>
          <h3>INVOICE</h3>
        </div>

        <hr />

        <p><b>Invoice No:</b> #{order.id}</p>
        <p><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>
        <p><b>Customer:</b> {order.user}</p>
        <p><b>Payment:</b> {order.method}</p>

        <hr />

        {/* Table */}
        <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#2563eb", color: "#fff" }}>
              <th align="left">Product</th>
              <th align="center">Qty</th>
              <th align="right">Price</th>
              <th align="right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                <td>{item.name}</td>
                <td align="center">{item.qty || 1}</td>
                <td align="right">₹{item.price}</td>
                <td align="right">₹{item.price * (item.qty || 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div style={{ marginTop: 16, borderTop: "2px solid #000", paddingTop: 10 }}>
          <h3 style={{ textAlign: "right" }}>Grand Total: ₹{order.total}</h3>
        </div>

        <hr />

        {/* Address */}
        <h4>Shipping Address</h4>
        <p>{order.address}</p>
        <p>{order.city} - {order.pincode}</p>

        <p style={{ marginTop: 30, fontStyle: "italic" }}>
          Thank you for shopping with Friends Auto Spares 
        </p>
      </div>
    </>
  );
}