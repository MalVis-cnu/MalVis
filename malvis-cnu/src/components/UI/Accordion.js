import { useRef, useState } from "react";
import chevronDown from "../../assets/images/chevron-down.svg";
import "./Accordion.css";

const Accordion = ({ header, style, children }) => {
  const conRef = useRef(null);
  const itemRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleAccordion = (event) => {
    event.stopPropagation();

    if (!isOpen) {
      conRef.current.style.height = "100%";
      itemRef.current.style.display = "block";
      itemRef.current.style.height = `${style.height}px`;
    } else {
      conRef.current.style.height = "auto";
      itemRef.current.style.display = "none";
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="szh-accordion">
      <div
        className={
          isOpen
            ? `szh-accordion__item szh-accordion__item--expanded`
            : "szh-accordion__item"
        }
        ref={conRef}
      >
        <h3 className="szh-accordion__item-heading">
          <button
            className="szh-accordion__item-btn"
            type="button"
            onClick={handleAccordion}
          >
            {header}
            <img
              className="chevron-down"
              src={chevronDown}
              alt="Chevron Down"
            />
          </button>
        </h3>
        <div className="szh-accordion__item-content" ref={itemRef}>
          <div role="region" className="szh-accordion__item-panel">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accordion;
