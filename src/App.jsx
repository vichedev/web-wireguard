import { useState } from "react";
import WelcomePage from "./components/WelcomePage";
import WireGuardGenerator from "./components/WireGuardGenerator";

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  const handleBackToHome = () => {
    setShowWelcome(true);
  };

  return (
    <>
      {showWelcome ? (
        <WelcomePage onGetStarted={handleGetStarted} />
      ) : (
        <WireGuardGenerator onBackToHome={handleBackToHome} />
      )}
    </>
  );
}

export default App;
