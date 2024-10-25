import "./Header.css";
import logo from "../../assets/images/logo.svg";

const Header = () => {
  return (
    <header className="header">
      <img alt="logo" src={logo} className="logo" onClick={function() {location.href = location.href;}} style={{cursor: 'pointer'}}/>
      <h1 className="title" onClick={function() {location.href = location.href;}} style={{cursor: 'pointer'}}>MalVis</h1>
    </header>
  );
};

export default Header;
