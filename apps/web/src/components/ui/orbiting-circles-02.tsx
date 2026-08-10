import type { CSSProperties } from 'react';
import ParticleSphere from './orbiting-circles-02-utils/particle-sphere';
import {
  JsIcon, TsIcon, PhpIcon, LaravelIcon, DockerIcon, RestApiIcon,
} from './orbiting-circles-02-utils/tech-icons';
import styles from './OrbitingCircles.module.css';

type OrbitIcon = { Icon: () => JSX.Element; alt: string; angle: number };

const orbits: { sizeMob: number; size: number; duration: number; icons: OrbitIcon[] }[] = [
  {
    sizeMob: 440, size: 720, duration: 18,   // w-110/w-180 * 4
    icons: [
      { Icon: PhpIcon,     alt: 'PHP',     angle: -60 },
      { Icon: LaravelIcon, alt: 'Laravel', angle:   0 },
      { Icon: DockerIcon,  alt: 'Docker',  angle:  60 },
    ],
  },
  {
    sizeMob: 600, size: 880, duration: 24,   // w-150/w-220 * 4
    icons: [
      { Icon: JsIcon, alt: 'JavaScript', angle:   0 },
      { Icon: TsIcon, alt: 'TypeScript', angle: -90 },
    ],
  },
  {
    sizeMob: 720, size: 1060, duration: 30,  // w-180/w-265 * 4
    icons: [
      { Icon: RestApiIcon, alt: 'REST API',    angle: -60 },
      { Icon: JsIcon,      alt: 'JavaScript 2', angle:   0 },
      { Icon: PhpIcon,     alt: 'PHP 2',        angle:  60 },
    ],
  },
];

export default function OrbitingCircles() {
  return (
    <div className={styles.wrapper}>

      {/* Centre particle globe */}
      <div className={styles.sphere}>
        <ParticleSphere />
      </div>

      {/* Orbit rings */}
      {orbits.map((orbit, oi) => {
        const isCW        = oi % 2 === 0;
        const orbitAnim   = isCW ? 'orbit-cw'  : 'orbit-ccw';
        const counterAnim = isCW ? 'counter-cw' : 'counter-ccw';

        // Mirror icons 180° to populate both halves of the ring
        const allIcons: OrbitIcon[] = [
          ...orbit.icons,
          ...orbit.icons.map((ic) => ({ ...ic, angle: ic.angle + 180, alt: `${ic.alt}-m` })),
        ];

        return (
          <div
            key={oi}
            className={styles.ring}
            style={{
              '--ring-size':     `${orbit.size}px`,
              '--ring-size-mob': `${orbit.sizeMob}px`,
            } as CSSProperties}
          >
            {allIcons.map((ic, ii) => (
              <div
                key={ii}
                className={styles.arm}
                style={{
                  '--start-angle': `${ic.angle}deg`,
                  animationName:     orbitAnim,
                  animationDuration: `${orbit.duration}s`,
                } as CSSProperties}
              >
                <div
                  className={styles.icon}
                  style={{
                    '--counter-offset': `${-ic.angle}deg`,
                    animationName:     counterAnim,
                    animationDuration: `${orbit.duration}s`,
                  } as CSSProperties}
                  aria-label={ic.alt}
                >
                  <ic.Icon />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
