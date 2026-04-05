import React from "react";
import "./TaglineSection.css";

export default function TaglineSection() {
  return (
    <section
      className="tagline-section"
      aria-labelledby="tagline-section-heading"
    >
      <div className="tagline-section__inner">
        <h2 id="tagline-section-heading" className="tagline-section__headline">
          <span className="tagline-section__line">ROMAIN</span>
          <span className="tagline-section__line">CALM</span>
          <span className="tagline-section__line">AND</span>
          <span
            className="tagline-section__line tagline-section__line--accent"
            data-text="LETTUCE"
          >
            LETTUCE
          </span>
          <span className="tagline-section__line">DESIGN</span>
        </h2>
      </div>
    </section>
  );
}
