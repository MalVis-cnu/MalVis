import "./Button.css";

const Button = ({ type, children, className, onClick }) => {
  return (
    <button
      type={type || "button"}
      className={className || "apply"}
      onClick={onClick || null}
    >
      {children}
    </button>
  );
};

export default Button;
