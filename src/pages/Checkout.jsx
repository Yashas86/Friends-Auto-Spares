import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { supabase } from "../supabase";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const isMobile = () => window.innerWidth <= 768;

function FlyToLocation({ pos }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    map.flyTo(pos, 16, { duration: 1.5 });
  }, [pos, map]);

  return null;
}

function DraggableMarker({ pos, setPos, setAddress, setCity, setPincode }) {
  return (
    <Marker
      position={pos}
      draggable
      eventHandlers={{
        dragend: (event) => {
          const { lat, lng } = event.target.getLatLng();
          setPos([lat, lng]);
          fetchAddress(lat, lng, setAddress, setCity, setPincode);
        },
      }}
    >
      <Popup>Drag to adjust location</Popup>
    </Marker>
  );
}

async function fetchAddress(lat, lng, setAddress, setCity, setPincode) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );

    const data = await res.json();

    const fullAddress = `${data.address?.road || ""}, ${data.address?.suburb || ""}, ${
      data.address?.city || ""
    }, ${data.address?.state || ""}, ${data.address?.postcode || ""}, ${
      data.address?.country || ""
    }`;

    const city = data.address?.city || data.address?.town || data.address?.village || "";
    const pincode = data.address?.postcode || "";

    setAddress(fullAddress);
    setCity(city);
    setPincode(pincode);
  } catch (error) {
    console.error(error);
    alert("We could not retrieve the selected address. Please try again.");
  }
}

export default function Checkout({ cart, currentUser }) {
  const navigate = useNavigate();
  const savedAddress = JSON.parse(
    localStorage.getItem(`address_${currentUser.email}`) || "null"
  );

  const [pos, setPos] = useState([12.9716, 77.5946]);
  const [address, setAddress] = useState(savedAddress?.address || "");
  const [city, setCity] = useState(savedAddress?.city || "");
  const [pincode, setPincode] = useState(savedAddress?.pincode || "");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [fullMap, setFullMap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  useEffect(() => {
    window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  }, [fullMap]);

  useEffect(() => {
    if (!cart.length) {
      navigate("/cart");
    }
  }, [cart, navigate]);

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const getLiveLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (geo) => {
        const { latitude, longitude } = geo.coords;

        setPos((currentPos) => {
          const [startLat, startLng] = currentPos;
          const steps = 20;
          let index = 0;

          const animate = window.setInterval(() => {
            index += 1;
            const lat = startLat + (latitude - startLat) * (index / steps);
            const lng = startLng + (longitude - startLng) * (index / steps);
            setPos([lat, lng]);

            if (index === steps) {
              window.clearInterval(animate);
              fetchAddress(latitude, longitude, setAddress, setCity, setPincode);
            }
          }, 20);

          return currentPos;
        });
      },
      () => alert("Location access was denied. Please enable location permission and try again."),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const beginCheckoutAction = () => {
    if (submitLockRef.current) {
      return false;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    return true;
  };

  const resetCheckoutAction = () => {
    submitLockRef.current = false;
    setIsSubmitting(false);
  };

  const buildInvoicePdf = (items, total, customerEmail) => {
    const doc = new jsPDF();
    doc.text("Friends Auto Spares - Invoice", 20, 20);
    doc.text(`Customer: ${customerEmail}`, 20, 35);
    doc.text(`Total: Rs.${total}`, 20, 45);

    let y = 60;
    items.forEach((item) => {
      doc.text(`${item.name} x ${item.qty} = Rs.${item.price * item.qty}`, 20, y);
      y += 10;
    });

    return doc.output("blob");
  };

  const syncOrderToSupabase = async (statusLabel) => {
    const { data: orderRow, error: insertError } = await supabase
      .from("orders")
      .insert({
        user_email: currentUser.email,
        total: totalAmount,
        status: statusLabel,
      })
      .select()
      .single();

    if (insertError || !orderRow) {
      console.error("Supabase order insert failed:", insertError);
      return null;
    }

    const pdfBlob = buildInvoicePdf(cart, totalAmount, currentUser.email);
    const fileName = `invoice-${orderRow.id}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(fileName, pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Invoice upload failed:", uploadError);
      return orderRow;
    }

    const { data: publicData } = supabase.storage.from("invoices").getPublicUrl(fileName);

    if (!publicData?.publicUrl) {
      console.error("Invoice public URL generation failed");
      return orderRow;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ invoice_url: publicData.publicUrl })
      .eq("id", orderRow.id);

    if (updateError) {
      console.error("Invoice URL save failed:", updateError);
    }

    return orderRow;
  };

  const saveLocalOrder = (orderPayload) => {
    const storageKey = `orders_${currentUser.email}`;
    const existingOrders = JSON.parse(localStorage.getItem(storageKey) || "[]");
    localStorage.setItem(storageKey, JSON.stringify([orderPayload, ...existingOrders]));
  };

  const finalizeSuccessfulOrder = async (orderPayload) => {
    localStorage.setItem(
      `address_${currentUser.email}`,
      JSON.stringify({ address, city, pincode })
    );
    saveLocalOrder(orderPayload);
    resetCheckoutAction();
    navigate("/order-success", {
      state: { order: orderPayload },
    });
  };

  const placeOrderCOD = async () => {
    if (!address) return alert("Please enter or select a delivery address before continuing.");

    if (!beginCheckoutAction()) {
      return;
    }

    try {
      const orderPayload = {
        id: Date.now(),
        user: currentUser.email,
        items: cart,
        total: totalAmount,
        method: "COD",
        address,
        city,
        pincode,
        status: "Confirmed",
        createdAt: new Date().toISOString(),
      };

      const orderResponse = await fetch("https://friends-auto-backend.onrender.com/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        throw new Error(`Order save failed with status ${orderResponse.status}`);
      }

      try {
        await syncOrderToSupabase("Confirmed");
      } catch (syncError) {
        console.error("Optional order sync failed:", syncError);
      }

      await finalizeSuccessfulOrder(orderPayload);
    } catch (error) {
      console.error(error);
      alert("We could not place your order at the moment. Please try again.");
      resetCheckoutAction();
    }
  };

  const payWithRazorpay = async () => {
    if (!address) return alert("Please enter or select a delivery address before continuing.");

    if (!beginCheckoutAction()) {
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay is not available right now. Please try again in a moment.");
      resetCheckoutAction();
      return;
    }

    try {
      const res = await fetch("https://friends-auto-backend.onrender.com/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });

      if (!res.ok) {
        throw new Error(`Razorpay order creation failed with status ${res.status}`);
      }

      const order = await res.json();

      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "Friends Auto Spares",
        description: "Bike Parts Order",
        order_id: order.id,
        modal: {
          ondismiss: () => {
            resetCheckoutAction();
          },
        },
        handler: async function handlePayment(response) {
          try {
            const orderPayload = {
              id: response.razorpay_payment_id,
              user: currentUser.email,
              items: cart,
              total: totalAmount,
              method: "ONLINE",
              paymentId: response.razorpay_payment_id,
              address,
              city,
              pincode,
              status: "Paid",
              createdAt: new Date().toISOString(),
            };

            const orderResponse = await fetch("https://friends-auto-backend.onrender.com/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(orderPayload),
            });

            if (!orderResponse.ok) {
              throw new Error(`Order save failed with status ${orderResponse.status}`);
            }

            try {
              await syncOrderToSupabase("Paid");
            } catch (syncError) {
              console.error("Optional order sync failed:", syncError);
            }

            await finalizeSuccessfulOrder(orderPayload);
          } catch (error) {
            console.error(error);
            alert(
              "Payment was captured, but we could not finish the order confirmation. Please contact support."
            );
            resetCheckoutAction();
          }
        },
        prefill: { email: currentUser?.email },
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        resetCheckoutAction();
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Razorpay could not be opened right now. Please try again.");
      resetCheckoutAction();
    }
  };

  const handleCheckoutSubmit = () => {
    if (paymentMethod === "COD") {
      placeOrderCOD();
      return;
    }

    payWithRazorpay();
  };

  return (
    <div className="checkout-page-shell">
      <section className="checkout-hero-panel">
        <div>
          <span className="page-kicker">Checkout</span>
          <h1>Confirm your address, choose payment, and place your order.</h1>
          <p>
            Review delivery details, pin your location, and finish the order in
            a cleaner checkout flow.
          </p>
        </div>

        <div className="checkout-hero-stat">
          <strong>Rs. {totalAmount}</strong>
          <span>order total</span>
        </div>
      </section>

      <div className="checkout-layout-v2">
        <section className="checkout-panel-card">
          <div className="checkout-section-head">
            <div>
              <span className="page-kicker">Delivery details</span>
              <h2>Shipping address</h2>
            </div>
          </div>

          <textarea
            placeholder="Full address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="checkout-textarea"
          />

          <div className="checkout-field-grid">
            <input
              placeholder="City"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
            <input
              placeholder="Pincode"
              value={pincode}
              onChange={(event) => setPincode(event.target.value)}
            />
          </div>

          <div className="checkout-action-row">
            <button className="surface-secondary-btn" onClick={getLiveLocation}>
              Use live location
            </button>
            <button
              className="surface-danger-btn"
              onClick={() => {
                setAddress("");
                setCity("");
                setPincode("");
                localStorage.removeItem(`address_${currentUser.email}`);
              }}
            >
              Clear saved address
            </button>
          </div>

          <div className={fullMap ? "map-fullscreen" : "checkout-map-shell"}>
            <MapContainer
              center={pos}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FlyToLocation pos={pos} />
              <DraggableMarker
                pos={pos}
                setPos={setPos}
                setAddress={setAddress}
                setCity={setCity}
                setPincode={setPincode}
              />
            </MapContainer>

            <div className="map-actions">
              {!fullMap && isMobile() ? (
                <button onClick={() => setFullMap(true)}>Fullscreen</button>
              ) : null}
              {fullMap ? <button onClick={() => setFullMap(false)}>Close</button> : null}
            </div>
          </div>

          <div className="checkout-section-head">
            <div>
              <span className="page-kicker">Payment</span>
              <h2>Select payment method</h2>
            </div>
          </div>

          <div className="checkout-payment-grid">
            <button
              className={`checkout-payment-card ${
                paymentMethod === "COD" ? "active" : ""
              }`}
              onClick={() => setPaymentMethod("COD")}
              disabled={isSubmitting}
            >
              <strong>Cash on Delivery</strong>
              <span>Pay when the order arrives at your address.</span>
            </button>

            <button
              className={`checkout-payment-card ${
                paymentMethod === "ONLINE" ? "active" : ""
              }`}
              onClick={() => setPaymentMethod("ONLINE")}
              disabled={isSubmitting}
            >
              <strong>Razorpay</strong>
              <span>Complete payment securely before order confirmation.</span>
            </button>
          </div>
        </section>

        <aside className="checkout-summary-v2">
          <span className="page-kicker">Order summary</span>
          <h2>Review your items</h2>

          <div className="checkout-summary-list">
            {cart.map((item) => (
              <div key={item.id} className="checkout-summary-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>Qty {item.qty}</span>
                </div>
                <strong>Rs. {item.price * item.qty}</strong>
              </div>
            ))}
          </div>

          <div className="checkout-total-box">
            <span>Total amount</span>
            <strong>Rs. {totalAmount}</strong>
          </div>

          <button
            className="surface-primary-btn"
            onClick={handleCheckoutSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? paymentMethod === "COD"
                ? "Placing your order..."
                : "Opening Razorpay..."
              : paymentMethod === "COD"
              ? "Place COD order"
              : "Pay with Razorpay"}
          </button>
        </aside>
      </div>
    </div>
  );
}
