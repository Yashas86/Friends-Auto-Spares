import { useLocation, useNavigate } from "react-router-dom";
import Invoice from "../components/Invoice";

export default function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  if (!order) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <h2>❌ No order found</h2>
        <button onClick={() => navigate("/shop")}>Go to Shop</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>✅ Order Placed Successfully</h2>
      <p>Order ID: {order.id}</p>
      <p>Total: ₹{order.total}</p>

      <Invoice order={order} />
    </div>
  );
}