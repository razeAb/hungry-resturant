import React, { useContext, useState } from "react";
import CartContext from "../context/CartContext"; // Import the CartContext
import "./Modal.css"; // Ensure this includes your existing modal and checkbox styles
import Button from "../layouts/Button";

const Modal = ({ img, title, price, description, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({
    vegetables: [],
    additions: [],
  });

  const { addToCart } = useContext(CartContext); // Access addToCart function

  if (!isOpen) return null;

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleVegetableChange = (vegetable) => {
    setSelectedOptions((prev) => ({
      ...prev,
      vegetables: prev.vegetables.includes(vegetable)
        ? prev.vegetables.filter((item) => item !== vegetable)
        : [...prev.vegetables, vegetable],
    }));
  };

  const getPrice = (addition) => {
    const priceMatch = addition.match(/(\d+)/);
    return priceMatch ? parseFloat(priceMatch[1]) : 0;
  };

  const handleAdditionChange = (addition) => {
    const additionPrice = getPrice(addition);
    setSelectedOptions((prev) => ({
      ...prev,
      additions: prev.additions.some((item) => item.addition === addition)
        ? prev.additions.filter((item) => item.addition !== addition)
        : [...prev.additions, { addition, price: additionPrice }],
    }));
  };

  const calculateTotalPrice = () => {
    const additionsTotal = selectedOptions.additions.reduce((total, item) => total + item.price, 0);
    const totalPrice = (parseFloat(price) + additionsTotal) * quantity;
    return Number.isInteger(totalPrice) ? totalPrice : totalPrice.toFixed(2);
  };

  const handleAddToCart = () => {
    const totalPrice = calculateTotalPrice();
    const itemToAdd = {
      id: `${title}-${Math.random().toString(36).substring(7)}`, // Generate a unique ID
      img,
      title,
      price: parseFloat(price),
      quantity,
      selectedOptions,
      totalPrice: parseFloat(totalPrice),
    };

    addToCart(itemToAdd); // Add to cart via context
    onClose(); // Close the modal
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <img src={img} alt={title} className="modal-img" />
        <h2 className="font-semibold text-center text-xl pt-6">{title}</h2>

        {/* Dynamically updated price */}
        <p className="modal-price text-center">
          {Number.isInteger(calculateTotalPrice()) ? calculateTotalPrice() : calculateTotalPrice().toFixed(2)} ILS
        </p>

        <p className="modal-description font-semibold text-center text-xl pt-6">{description}</p>

        {/* Options for Vegetables */}
        <div className="modal-options">
          <h3 className="text-2xl font-semibold text-center pb-10">:ירקות על המנה</h3>
          {["חסה", "מלפפון חמוץ", "עגבניה", "בצל", "סלט קרוב", "צימצורי"].map((vegetable, index) => (
            <div key={index} className="checkbox-wrapper-30 checkbox-container">
              <span className="checkbox">
                <input type="checkbox" id={`vegetable-option-${index}`} onChange={() => handleVegetableChange(vegetable)} />
                <svg>
                  <use xlinkHref="#checkbox-30" className="checkbox"></use>
                </svg>
              </span>
              <label htmlFor={`vegetable-option-${index}`} className="checkbox-label pl-2">
                {vegetable}
              </label>
            </div>
          ))}
        </div>

        {/* Options for Additions */}
        <div className="modal-options">
          <h3 className="text-2xl font-semibold text-center pb-10">:תוספת למנה רגילה</h3>
          {["הקפצת בלסמי 5", "12 צלי כתף", "אונטרייב 12", "ביקון טלה 10", "אסאדו 15", "רוטב גבינה 8", "פטריות 5", "ג׳בטה 5"].map(
            (addition, index) => (
              <div key={index} className="checkbox-wrapper-30 checkbox-container">
                <span className="checkbox">
                  <input type="checkbox" id={`addition-option-${index}`} onChange={() => handleAdditionChange(addition)} />
                  <svg>
                    <use xlinkHref="#checkbox-30" className="checkbox"></use>
                  </svg>
                </span>
                <label htmlFor={`addition-option-${index}`} className="checkbox-label pl-2">
                  {addition}
                </label>
              </div>
            )
          )}
        </div>

        <div className="modal-quantity">
          <button className="quantity-button" onClick={() => handleQuantityChange(-1)}>
            -
          </button>
          <span className="quantity-display">{quantity}</span>
          <button className="quantity-button" onClick={() => handleQuantityChange(1)}>
            +
          </button>
        </div>

        <div className="modal-add-button-container">
          <Button title="הוספה לעגלה" className="modal-add-button" onClick={handleAddToCart} />
        </div>

        {/* SVG for checkbox */}
        <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
          <symbol id="checkbox-30" viewBox="0 0 22 22">
            <path
              fill="none"
              stroke="currentColor"
              d="M5.5,11.3L9,14.8L20.2,3.3l0,0c-0.5-1-1.5-1.8-2.7-1.8h-13c-1.7,0-3,1.3-3,3v13c0,1.7,1.3,3,3,3h13 c1.7,0,3-1.3,3-3v-13c0-0.4-0.1-0.8-0.3-1.2"
            />
          </symbol>
        </svg>
      </div>
    </div>
  );
};

export default Modal;
