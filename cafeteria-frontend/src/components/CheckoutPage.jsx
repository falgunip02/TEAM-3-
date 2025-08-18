import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart: contextCart, clearCart } = useCart();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (contextCart && contextCart.length > 0) {
      setCart(contextCart);
    } else {
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(storedCart);
    }
  }, [contextCart]);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const handlePayment = async () => {
    setLoading(true);
    try {
      // const payload = {
      //   items: cart.map((item) => ({
      //     menuItemId: item.menuItemId || item.id || item._id,
      //     quantity: parseInt(item.quantity || 1, 10),
      //     priceAtOrder: parseFloat(item.price)
      //   })),
      //   totalPrice: parseFloat(totalPrice.toFixed(2)), // ✅ correct key
      //   pickupTime: new Date(Date.now() + 30 * 60000).toISOString()
      // };

      // console.log("Payload being sent:", payload);

      // await axios.post(
      //   "http://localhost:8000/api/orders",
      //   payload,
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );



      const payload = {
  items: cart.map(item => ({
    menuItemId: item.menuItemId || item.id, // already stored from MenuPage
    quantity: Number(item.quantity),
    priceAtOrder: Number(item.price)
  })),
  totalPrice: Number(totalPrice.toFixed(2)),
  pickupTime: new Date(Date.now() + 30 * 60000).toISOString()
};

await axios.post("http://localhost:8000/api/orders", payload, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  }
});


      alert("Payment Successful! 🎉 Order placed.");
      clearCart();
      localStorage.removeItem("cart");
      navigate("/orders");
    } catch (err) {
      console.error("Order error:", err.response?.data || err.message);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Secure Payment Gateway</h1>

        <p className="mb-4 text-center">
          You are paying for {cart.length} item(s) — Total ₹{totalPrice.toFixed(2)}
        </p>

        <div className="mb-4">
          <label className="block font-medium">Card Number</label>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            className="w-full border border-gray-300 rounded p-2 mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium">Expiry Date</label>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full border border-gray-300 rounded p-2 mt-1"
            />
          </div>
          <div>
            <label className="block font-medium">CVV</label>
            <input
              type="password"
              placeholder="***"
              className="w-full border border-gray-300 rounded p-2 mt-1"
            />
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          {loading ? "Processing..." : `Pay Now ₹${totalPrice.toFixed(2)}`}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          This is a simulated payment page. No real transactions occur.
        </p>
      </div>
    </div>
  );
}
