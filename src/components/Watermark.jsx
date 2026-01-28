import React from "react";

const Watermark = () => {
  console.log("Watermark component is rendering");

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A] via-[#0E1424] to-black z-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04] z-10"
      >
        <img
          src="/assets/brand/logos/soshlops_logo_white.svg"
          alt="Watermark"
          className="w-[70vw] max-w-[900px] object-contain"
        />
      </div>
    </div>
  );
};

export default Watermark;