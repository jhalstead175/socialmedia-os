import React from "react";

const Watermark = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A] via-[#0E1424] to-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]"
      >
        <img
          src="/brand/logos/soshlops-mark.svg"
          alt=""
          className="w-[70vw] max-w-[900px] object-contain"
        />
      </div>
    </div>
  );
};

export default Watermark;