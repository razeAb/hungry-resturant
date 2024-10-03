import React, { useContext, useState } from "react";
import CartContext from "../context/CartContext";
import CartNavbar from "./CartNavbar";
import ClosedModal from "./ClosedModal";

const CartPage = () => {
  const { cartItems, removeFromCart } = useContext(CartContext);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsClosedModalOpen(false);
  };

  const handleOrderNow = () => {
    setShowConfirmationModal(true);
  };

  const closeModal = () => {
    setShowConfirmationModal(false);
  };

  // Group items by id and calculate the quantity for identical items
  const groupCartItems = () => {
    const groupedItems = {};
    cartItems.forEach((item) => {
      if (groupedItems[item.id]) {
        groupedItems[item.id].quantity += item.quantity;
      } else {
        groupedItems[item.id] = { ...item };
      }
    });
    return Object.values(groupedItems);
  };

  // Calculate the total cost of each item, considering additional weights for grams
  const calculateItemTotal = (item) => {
    const additionsTotal =
      item.selectedOptions?.additions?.reduce((total, add) => {
        if (add.grams === 50) {
          return total + 13; // Add 13 ILS for 50 grams
        } else if (add.grams === 100) {
          return total + 26; // Add 26 ILS for 100 grams
        } else {
          return total + add.price;
        }
      }, 0) || 0;

    const itemTotal = item.isWeighted ? item.price * item.quantity + additionsTotal : item.price * item.quantity + additionsTotal;

    return parseFloat(itemTotal.toFixed(2)); // Round to 2 decimal places
  };

  const sendWhatsAppOrder = () => {
    const currentDay = new Date().getDay();
    if (currentDay === 3) {
      setIsClosedModalOpen(true);
      return;
    }

    const orderDetails = groupCartItems()
      .map((item) => {
        const itemTotalPrice = calculateItemTotal(item);
        const vegetables = item.selectedOptions?.vegetables?.join(", ") || "אין";
        const additions =
          item.selectedOptions?.additions?.map((add) => `${add.addition} ${add.grams ? `(${add.grams} גרם)` : ""}`).join(", ") || "אין";

        return `
          מוצר: ${item.title}
          כמות: ${item.isWeighted ? item.quantity + " גרם" : item.quantity}
          ירקות: ${vegetables}
          תוספות: ${additions}
          מחיר ליחידה: ${item.price} ILS
          מחיר סופי: ${itemTotalPrice} ILS
        `.trim();
      })
      .join("\n\n");

    const totalPrice = groupCartItems()
      .reduce((total, item) => total + parseFloat(calculateItemTotal(item)), 0)
      .toFixed(2);

    const message = `פרטי הזמנה:\n\n${orderDetails}\n\nסה"כ: ${totalPrice} ILS`;
    const whatsappUrl = `https://wa.me/+972507203099?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (cartItems.length === 0) {
    return (
      <>
        <CartNavbar />
        <div style={{ padding: "20px" }}>
          <h2>העגלה שלך ריקה</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <CartNavbar />
      <div style={{ padding: "20px" }}>
        <h2>העגלה שלך</h2>
        <div className="cart-table-container">
          <table className="cart-table">
            <thead>
              <tr>
                <th>תמונה</th>
                <th>שם מוצר</th>
                <th>כמות</th>
                <th>ירקות</th>
                <th>תוספות</th>
                <th>מחיר ליחידה</th>
                <th>מחיר סופי</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {groupCartItems().map((item, index) => {
                const itemTotalPrice = calculateItemTotal(item);

                return (
                  <tr key={index}>
                    <td data-label="תמונה">
                      <img src={item.img} alt={item.title} style={{ width: "100px", borderRadius: "8px" }} />
                    </td>
                    <td data-label="שם מוצר">{item.title}</td>
                    <td data-label="כמות">{item.isWeighted ? `${item.quantity} גרם` : item.quantity}</td>
                    <td data-label="ירקות">{item.selectedOptions?.vegetables?.join(", ") || "אין"}</td>
                    <td data-label="תוספות">
                      {item.selectedOptions?.additions
                        ?.map((add) => `${add.addition} ${add.grams ? `(${add.grams} גרם)` : ""}`)
                        .join(", ") || "אין"}
                    </td>
                    <td data-label="מחיר ליחידה">{item.price} ILS</td>
                    <td data-label="מחיר סופי">{itemTotalPrice} ILS</td>
                    <td data-label="פעולות">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "#ff6f61",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        הסר
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="cart-total">
          סה"כ:{" "}
          {groupCartItems()
            .reduce((total, item) => total + parseFloat(calculateItemTotal(item)), 0)
            .toFixed(2)}{" "}
          ILS
        </div>
        <div style={{ marginTop: "20px" }}>
          <button onClick={handleOrderNow}>הזמן עכשיו</button>
        </div>
        {showConfirmationModal && !isClosedModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 style={{ direction: "rtl", textAlign: "right" }}>אישור הזמנה</h2>
              <p style={{ direction: "rtl", textAlign: "right", paddingBottom: "20px" }}>ההזמנה שלך תישלח לוואטסאפ. נא לאשר.</p>
              <div className="modal-buttons" style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={sendWhatsAppOrder}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#25D366",
                    color: "#fff",
                    borderRadius: "5px",
                  }}
                >
                  שלח דרך וואטסאפ
                </button>
                <button
                  onClick={closeModal}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#ccc",
                    borderRadius: "5px",
                  }}
                >
                  בטל
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .cart-table {
          padding-top: 40px;
          width: 100%;
          border-collapse: collapse;
        }

        .cart-table th,
        .cart-table td {
          text-align: left;
          padding: 10px;
          border-bottom: 1px solid #ccc;
        }

        .cart-total {
          margin-top: 20px;
          font-weight: bold;
          font-size: 16px;
        }

        button {
          padding: 10px 20px;
          background-color: #007bff;
          color: #fff;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
        }

        @media (max-width: 460px) {
          .cart-table {
            display: block;
            width: 100%;
            overflow-x: auto;
            position: relative;
          }

          thead {
            display: none;
          }

          tbody {
            display: block;
          }

          tr {
            display: block;
            border-bottom: 1px solid #ccc;
            padding: 10px 0;
            margin-bottom: 10px;
          }

          td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border: none;
          }

          td:after {
            content: attr(data-label);
            flex: 0 0 100px;
            font-weight: bold;
            color: #555;
          }

          .cart-table td img {
            width: 80px;
            margin-bottom: 10px;
          }
        }

        .modal-buttons {
          display: flex;
          gap: 10px;
        }
      `}</style>

      <ClosedModal isOpen={isClosedModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default CartPage;