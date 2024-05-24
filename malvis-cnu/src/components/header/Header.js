import "./Header.css";
import logo from "../../assets/images/logo.svg";

const Header = () => {
  return (
    <header className="header">
      <img alt="logo" src={logo} className="logo" />
      <h1 className="title">MalVis</h1>
    </header>
  );
};

export default Header;
