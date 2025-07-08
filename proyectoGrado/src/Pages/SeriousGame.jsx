import React, { useEffect, useRef } from "react";
import "./SeriousGame.css"; // 👈 Importa el CSS

const SeriousGame = () => {
  const unityContainerRef = useRef();
  const unityInstanceRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/unity/Build/unity.loader.js";

    script.onload = () => {
      if (window.createUnityInstance && !unityInstanceRef.current) {
        window
          .createUnityInstance(unityContainerRef.current, {
            dataUrl: "/unity/Build/unity.data",
            frameworkUrl: "/unity/Build/unity.framework.js",
            codeUrl: "/unity/Build/unity.wasm",
            companyName: "MiEmpresa",
            productName: "MiJuego",
            productVersion: "1.0",
             width: 2000,
    height: Math.floor(1100 * 9 / 16),  // para mantener 16:9, aprox 618px
    devicePixelRatio: 1 
          })
          .then((instance) => {
            unityInstanceRef.current = instance;
            console.log("✅ Unity game loaded successfully");

            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            if (token && userId) {
              instance.SendMessage("UserData", "SetTokenAndId", `${token}|${userId}`);
            } else {
              console.warn("⚠️ No se encontró token o userId");
            }
          })
          .catch((err) => console.error("❌ Error al iniciar Unity:", err));
      }
    };

    document.body.appendChild(script);

    return () => {
  if (unityInstanceRef.current) {
    unityInstanceRef.current.Quit().then(() => {
      console.log(" Unity game instance destroyed");
    });
  }
  document.body.removeChild(script);
};

  }, []);

  return (
    <div className="serious-game-container">
      <canvas
        id="unity-canvas"
        ref={unityContainerRef}
      />
    </div>
  );
};

export default SeriousGame;
