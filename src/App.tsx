import React, { useState } from 'react';
import TaglineSection from './sections/TaglineSection/TaglineSection';
import Timeline from './sections/Timeline/Timeline';
import WhatsNextSection from './sections/WhatsNextSection/WhatsNextSection';

function App() {
  const [pageBg, setPageBg] = useState('#121212');

  return (
    <div
      style={{
        '--bg-wash': pageBg,
        backgroundColor: pageBg,
        transition: 'background-color 0.35s ease',
      } as React.CSSProperties}
    >
      <Timeline onActiveColorChange={setPageBg} />
      <WhatsNextSection />
      <TaglineSection />
    </div>
  );
}

export default App;
