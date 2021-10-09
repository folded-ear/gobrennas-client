import React from "react";
import "./App.scss";
import DesktopApp from "./desktop/DesktopApp";
import MobileApp from "./mobile/MobileApp";
import { useIsMobile } from "./providers/IsMobile";

const App = () =>
    useIsMobile()
        ? <MobileApp />
        : <DesktopApp />;

export default App;
