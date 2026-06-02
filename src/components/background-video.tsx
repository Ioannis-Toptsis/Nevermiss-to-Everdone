const fallbackVideoUrl = "https://moewalls.com/wp-content/uploads/preview/2026/mint-sakura-street-view-neverness-to-everness-preview.webm";
const localVideoUrl = "/nte_bg.mp4";

export function BackgroundVideo() {
  const configuredVideoUrl = process.env.NEXT_PUBLIC_BACKGROUND_VIDEO_URL?.trim();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-cover opacity-30 saturate-75"
      >
        {configuredVideoUrl ? <source src={configuredVideoUrl} type="video/mp4" /> : null}
        {!configuredVideoUrl ? <source src={localVideoUrl} type="video/mp4" /> : null}
        {!configuredVideoUrl ? <source src={fallbackVideoUrl} type="video/webm" /> : null}
      </video>
      <div className="video-scrim absolute inset-0" />
    </div>
  );
}