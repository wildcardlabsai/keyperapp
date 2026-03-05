import { useLocation } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";

const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(false);
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShow(true));
    });
    return () => cancelAnimationFrame(t);
  }, [location.pathname]);

  return (
    <div
      className={`transition-opacity duration-300 ease-out ${show ? "opacity-100" : "opacity-0"}`}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
