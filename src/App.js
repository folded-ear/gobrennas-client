import React from "react";
import "./App.scss";
import useIsMobile from "./data/useIsMobile";
import DesktopApp from "./desktop/DesktopApp";
import MobileApp from "./mobile/MobileApp";

const App = () =>
    useIsMobile()
        ? <MobileApp />
        : <DesktopApp />;

export default App;
