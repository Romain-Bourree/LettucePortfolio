import React from "react";
import "./WhatsNextSection.css";

export default function WhatsNextSection() {
  return (
    <section className="whats-next" aria-labelledby="whats-next-heading">
      <div className="whats-next__inner">
        <h1 className="whats-next__kicker">What&apos;s next</h1>
        <h2 id="whats-next-heading" className="whats-next__lead">
          If you want to build something together,{" "}
          <a
            className="whats-next__button whats-next__cta whats-next__cta--link005"
            href="mailto:r.bourree@gmail.com"
            aria-label="Let's talk by email"
          >
            <span className="whats-next__cta-label">let&apos;s talk</span>
            <svg
              className="whats-next__cta-icon"
              fill="none"
              viewBox="0 0 10 10"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </h2>
      </div>
    </section>
  );
}
