import { useState } from "react";
import Aside from "../components/aside/Aside";
import Main from "../components/main/Main";

import "./Layout.css";

const Layout = () => {
  const [result, setResult] = useState({});

  const handleResult = (result) => {
    setResult(result);
  };

  return (
    <div className="layout">
      <Aside className="aside" onSendResult={handleResult} />
      <Main result={result} />
    </div>
  );
};

export default Layout;
