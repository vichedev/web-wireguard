import WelcomePage from "./components/WelcomePage";
import WireGuardGenerator from "./components/WireGuardGenerator";
import { usePersistentState } from "./hooks/useSessionState";
import { useTheme } from "./hooks/useTheme";

function App() {
  const [showWelcome, setShowWelcome] = usePersistentState("showWelcome", true);
  const { theme, toggleTheme } = useTheme();

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  const handleBackToHome = () => {
    setShowWelcome(true);
  };

  return (
    <>
      {showWelcome ? (
        <WelcomePage
          onGetStarted={handleGetStarted}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      ) : (
        <WireGuardGenerator
          onBackToHome={handleBackToHome}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
    </>
  );
}

export default App;
