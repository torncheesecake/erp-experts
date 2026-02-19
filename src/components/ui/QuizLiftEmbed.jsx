import { useEffect, useRef } from "react";

export default function QuizLiftEmbed() {
  const ref = useRef(null);
  useEffect(() => {
    const container = ref.current;
    const script = document.createElement("script");
    script.src = "http://localhost:5173/embed.js";
    script.dataset.slug = "erp-readiness";
    container.appendChild(script);
    return () => {
      container.innerHTML = "";
    };
  }, []);
  return <div id="quizlift" ref={ref} />;
}
