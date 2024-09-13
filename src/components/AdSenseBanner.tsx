import React from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

interface AdSenseProps {
  slot: string
}

const useEffectOnce = (callback: () => void) => {
  const hasRunOnce = React.useRef(false);
  React.useEffect(() => {
    if (!hasRunOnce.current) {
      callback();
      hasRunOnce.current = true;
    }
  }, []);
};

function AdSenseBanner({ slot }: AdSenseProps) {
  useEffectOnce(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({})
  });

  return (
    <div style={{ border: '1px solid white' }}>
      Ads
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8900122686773204"
        data-ad-slot={slot}
        data-ad-format="autorelaxed"
      ></ins>
    </div>
  )
}

export default AdSenseBanner