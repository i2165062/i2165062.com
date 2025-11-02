// i2165062 — NFT Page (subtle tilt on hover via mouse position)
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    let raf = null;

    function onMove(e){
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -6;  // tilt range
      const ry = ((x / rect.width)  - 0.5) *  6;

      if(!raf){
        raf = requestAnimationFrame(() => {
          card.style.transform = `translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
          raf = null;
        });
      }
    }

    function reset(){
      card.style.transform = "";
    }

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", reset);
    card.addEventListener("blur", reset);
  });
});
