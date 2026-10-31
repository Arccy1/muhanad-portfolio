/**
 * Site-wide cinematic ambience: three brand-colored light orbs drifting on
 * long alternating loops, thin timeline rails with a soft playhead sweep,
 * and a slow diagonal light beam. Pure CSS (transform/opacity only), fixed
 * behind all content, frozen entirely under prefers-reduced-motion.
 */
export default function CinematicBackground() {
  return (
    <div className="cine-bg" aria-hidden="true">
      <div className="cine-bg__layer cine-bg__orb-a" />
      <div className="cine-bg__layer cine-bg__orb-b" />
      <div className="cine-bg__layer cine-bg__orb-c" />
      <div className="cine-bg__lines">
        <span className="cine-line cine-line--a" />
        <span className="cine-line cine-line--b" />
        <span className="cine-line cine-line--c" />
      </div>
      <div className="cine-bg__sweep" />
      <div className="cine-bg__vignette" />
    </div>
  );
}
