import "./Button.css";

const Button = ({ type, children, className, onClick, isDisabled }) => {
  return (
    <button
      type={type || "button"}
      className={className || "apply"}
      onClick={onClick || null}
      disabled={isDisabled || false}
    >
      {children}
    </button>
  );
};

export default Button;
