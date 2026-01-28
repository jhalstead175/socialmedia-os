// Brand watermark — visual only.
// Do not add text, gradients, filters, or layout logic.

import React from "react";

const Watermark = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]"
    >
      <img
        src="/assets/brand/logos/soshlops_logo_white.svg"
        alt=""
        className="w-[70vw] max-w-[900px] object-contain"
      />
    </div>
  );
};

export default Watermark;