import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../fonts";
import { Plane, Stage } from "../../gacy/engine/camera";
import { Finish } from "../../gacy/engine/look";
import { Person } from "../../gacy/rig/Person";
import { SIT, STAND, idle, pose, talk } from "../../gacy/rig/pose";
import { ABBY, ANDREW_HOME, BRIDGET, EMMA, JURORS, KNOWLTON, LIZZIE, MILL_WORKERS, TOWNSFOLK } from "../rig/cast";
import { BordenSection, BordenSide, HOUSE } from "../kit/house";
import { BarnLoft, ChurchInterior, Courtroom, COURT, Drugstore, InquestRoom, LanternHall, SeriesSlide } from "../kit/interiors";
import { GuestRoom, Kitchen, SittingRoom } from "../kit/rooms";
import { Sinkers, Hatchet } from "../kit/props";
import { Cemetery, MainStreet, MillTown, SecondStreet, TheHill } from "../kit/town";
import { LIGHT } from "../theme";

/** One set per frame, for checking scale and look. Not part of the film. */
export const BordenSetTest: React.FC = () => {
  const frame = useCurrentFrame();
  const t = 3;
  const sets: React.ReactNode[] = [
    // 0 street, noon
    <Stage key={0} cam={{ x: 0, y: -700, zoom: 0.55 }} t={t}>
      <SecondStreet t={t} light={LIGHT.noon} heat={1} onWalk={<Person x={-600} look={TOWNSFOLK[0]} light={LIGHT.noon} pose={idle(STAND, t, 1)} />} />
    </Stage>,
    // 1 section wide
    <Stage key={1} cam={{ x: 0, y: -600, zoom: 0.52 }} t={t} bg="#1a1410">
      <Plane d={0}>
        <BordenSection
          t={t}
          light={LIGHT.room}
          lamps={{ guest: 0.2 }}
          people={{
            sitting: <Person x={-500} y={0} look={ANDREW_HOME} light={LIGHT.room} pose={idle(STAND, t, 2)} />,
            kitchen: <Person x={900} y={0} look={BRIDGET} light={LIGHT.room} pose={idle(STAND, t, 3)} />,
            lizzie: <Person x={-300} y={0} look={LIZZIE} light={LIGHT.room} pose={idle(STAND, t, 4)} />,
            guest: <Person x={-1000} y={0} look={ABBY} light={LIGHT.dim} pose={idle(STAND, t, 5)} />,
          }}
        />
      </Plane>
    </Stage>,
    // 2 sitting room close
    <Stage key={2} cam={{ x: -550, y: HOUSE.floor - 260, zoom: 1.7 }} t={t}>
      <Plane d={0}>
        <BordenSection t={t} light={LIGHT.room} people={{ sitting: <Person x={-750} y={0} look={ANDREW_HOME} light={LIGHT.room} pose={idle(SIT, t, 2)} /> }} />
      </Plane>
    </Stage>,
    // 3 mill town
    <Stage key={3} cam={{ x: 0, y: -900, zoom: 0.4 }} t={t}>
      <MillTown t={t} light={LIGHT.noon} />
    </Stage>,
    // 4 courtroom
    <Stage key={4} cam={{ x: 300, y: -500, zoom: 0.6 }} t={t}>
      <Plane d={0}>
        <Courtroom light={LIGHT.grey} t={t}>
          {JURORS.slice(0, 8).map((j, i) => (
            <Person key={i} x={COURT.jury - 800 + i * 220} y={-140} look={j} light={LIGHT.grey} pose={idle(SIT, t, i)} facing={-1} />
          ))}
          <Person x={COURT.prosecution} y={0} look={KNOWLTON} light={LIGHT.grey} pose={talk(idle(STAND, t, 30), t, 30)} />
          <Person x={COURT.defense + 100} y={0} look={LIZZIE} light={LIGHT.grey} pose={idle(SIT, t, 31)} />
        </Courtroom>
      </Plane>
    </Stage>,
    // 5 drugstore
    <Stage key={5} cam={{ x: 200, y: -300, zoom: 1.0 }} t={t}>
      <Plane d={0}>
        <Drugstore light={LIGHT.room} t={t} poisonGlint={1}>
          <Person x={-200} y={0} look={LIZZIE} light={LIGHT.room} pose={idle(STAND, t, 1)} view="back" />
        </Drugstore>
      </Plane>
      <Plane d={-1.2}>
        <Person x={500} y={0} look={MILL_WORKERS[0]} light={LIGHT.room} pose={idle(STAND, t, 6)} facing={-1} />
      </Plane>
    </Stage>,
    // 6 barn loft
    <Stage key={6} cam={{ x: 200, y: -450, zoom: 0.9 }} t={t}>
      <Plane d={0}>
        <BarnLoft light={LIGHT.dim} t={t} bench={<Sinkers x={0} y={0} light={LIGHT.dim} />}>
          <Person x={300} y={0} look={LIZZIE} light={LIGHT.dim} pose={idle(pose({ lean: 8, neck: 10 }), t, 1)} />
        </BarnLoft>
      </Plane>
    </Stage>,
    // 7 the hill
    <Stage key={7} cam={{ x: 0, y: -900, zoom: 0.36 }} t={t}>
      <TheHill t={t} light={LIGHT.afternoon} />
    </Stage>,
    // 8 cemetery
    <Stage key={8} cam={{ x: 0, y: -400, zoom: 0.7 }} t={t}>
      <Cemetery t={t} light={LIGHT.grey} />
    </Stage>,
    // 9 kitchen close, fire
    <Stage key={9} cam={{ x: 950, y: HOUSE.floor - 260, zoom: 1.5 }} t={t}>
      <Plane d={0}>
        <BordenSection t={t} light={LIGHT.room} props={{ fire: 1, calendarRing: 1 }} people={{ kitchen: <Person x={800} y={0} look={LIZZIE} light={LIGHT.room} pose={idle(STAND, t, 1)} facing={1} /> }} />
      </Plane>
    </Stage>,
    // 10 guest room close
    <Stage key={10} cam={{ x: -1050, y: HOUSE.upper - 260, zoom: 1.6 }} t={t}>
      <Plane d={0}>
        <BordenSection t={t} light={LIGHT.room} props={{ guestHem: 1, guestMade: 0.4 }} people={{ guest: <Person x={-900} y={0} look={ABBY} light={LIGHT.room} pose={idle(pose({ lean: 12 }), t, 1)} view="back" /> }} />
      </Plane>
    </Stage>,
    // 11 lantern hall
    <Stage key={11} cam={{ x: 0, y: -600, zoom: 0.55 }} t={t} bg="#0a0806">
      <Plane d={0}>
        <LanternHall light={LIGHT.lamp} t={t} slide={<SeriesSlide k={1} />}>
          {TOWNSFOLK.map((l, i) => (
            <Person key={i} x={-1500 + i * 500} y={0} look={l} light={LIGHT.lamp} pose={idle(SIT, t, i)} view="back" />
          ))}
        </LanternHall>
      </Plane>
    </Stage>,
    // 12 main street
    <Stage key={12} cam={{ x: 0, y: -700, zoom: 0.5 }} t={t}>
      <MainStreet t={t} light={LIGHT.noon} onWalk={<Person x={-300} look={TOWNSFOLK[2]} light={LIGHT.noon} pose={idle(STAND, t, 1)} />} />
    </Stage>,
    // 13 side of the house, night
    <Stage key={13} cam={{ x: 0, y: -700, zoom: 0.5 }} t={t} bg="#05060a">
      <Plane d={0}>
        <rect x={-30000} y={0} width={60000} height={3000} fill="#1a2a1c" />
        <BordenSide light={LIGHT.night} lit={0.8} t={t} night />
      </Plane>
    </Stage>,
    // 14 church interior
    <Stage key={14} cam={{ x: 0, y: -500, zoom: 0.7 }} t={t}>
      <Plane d={0}>
        <ChurchInterior light={LIGHT.room} t={t}>
          <Person x={-300} y={0} look={LIZZIE} light={LIGHT.room} pose={idle(STAND, t, 1)} />
          <Person x={300} y={0} look={EMMA} light={LIGHT.room} pose={idle(STAND, t, 2)} facing={-1} />
        </ChurchInterior>
      </Plane>
    </Stage>,
    // 15 inquest room
    <Stage key={15} cam={{ x: 0, y: -350, zoom: 0.9 }} t={t}>
      <Plane d={0}>
        <InquestRoom light={LIGHT.dim} t={t} minutes={615}>
          <Person x={-1000} y={0} look={LIZZIE} light={LIGHT.dim} pose={idle(SIT, t, 1)} />
          <Person x={200} y={0} look={KNOWLTON} light={LIGHT.dim} pose={talk(idle(STAND, t, 2), t, 2)} facing={-1} />
        </InquestRoom>
      </Plane>
    </Stage>,
    // 16 rooms standalone: sitting room, kitchen, guest room
    <Stage key={16} cam={{ x: 0, y: -280, zoom: 1.2 }} t={t}>
      <Plane d={0}>
        <SittingRoom x0={-800} x1={800} light={LIGHT.room} t={t} lamp={0.6}>
          <Person x={-300} y={0} look={LIZZIE} light={LIGHT.room} pose={idle(STAND, t, 1)} />
        </SittingRoom>
      </Plane>
    </Stage>,
    <Stage key={17} cam={{ x: 400, y: -280, zoom: 1.2 }} t={t}>
      <Plane d={0}>
        <Kitchen x0={-400} x1={1200} light={LIGHT.room} t={t} fire={1} ironing />
      </Plane>
    </Stage>,
    <Stage key={18} cam={{ x: 0, y: -280, zoom: 1.2 }} t={t}>
      <Plane d={0}>
        <GuestRoom x0={-700} x1={700} light={LIGHT.dim} t={t} hem={1} made={0.5} />
        <Hatchet light={LIGHT.dim} s={2} />
      </Plane>
    </Stage>,
  ];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {sets[frame % sets.length]}
      <Finish />
    </AbsoluteFill>
  );
};
