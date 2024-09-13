import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

interface AdSenseProps {
  slot: string
}

function AdSenseBanner({ slot }: AdSenseProps) {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({})
  }, []);

  return (
    <div style={{ border: '1px solid white' }}>
      Ads
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8900122686773204"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  )
}

export default AdSenseBanner