import { JOB_SHIFTS, JOB_SHIFTS_EXAMPLE } from "./job-shifts";
import {
  ACCENT,
  BERRY,
  BLUE,
  Book,
  Clipboard,
  CrossPin,
  EraChip,
  GREEN,
  GROUND,
  Hair,
  IRON,
  Orb,
  PAPER,
  Person,
  SOFT,
  SceneCanvas,
  Sheet,
  ShiftLabel,
  TwoWorlds,
  WALL,
  WOOD,
  WOOD_DARK,
  WOOD_LIGHT,
  scene,
  useProgress,
  useSince,
} from "./scene-kit";

/**
 * AI: someone buried in books and printouts, pages flipping and sheets flying
 * while they scratch their head; the desk greys out, and a person with a
 * clipboard marked with a medical cross directs an AI on a big screen.
 */
export const AI_SECONDS = 7.5;

const SHIFT = JOB_SHIFTS[2];
const TURN = 3.0;
const BEAT = {
  search: 0.4,
  person: TURN + 0.6,
  screen: TURN + 0.8,
  ask: TURN + 1.1,
  think: TURN + 1.5,
  answer: TURN + 2.1,
  label: 6,
};

const BOOKS = [
  [scene("stripe"), scene("cloth"), scene("wood-light"), scene("book"), BERRY],
  [scene("book"), BLUE, scene("stripe"), scene("wood-light")],
  [scene("cloth"), scene("wood-light"), BERRY, scene("book"), scene("cloth-roll")],
];

function Study() {
  return (
    <g>
      <rect x={8} y={40} width={236} height={GROUND - 40} rx={10} fill={WALL} />
      {/* bookshelf */}
      <rect x={16} y={62} width={52} height={GROUND - 62} fill={WOOD_DARK} />
      {[0, 1, 2].map((shelf) => {
        const y = 66 + shelf * 48;
        return (
          <g key={shelf}>
            <rect x={20} y={y} width={44} height={44} fill={scene("floorboards")} />
            {BOOKS[shelf].map((colour, i) => (
              <rect
                key={i}
                x={22 + i * 8.4}
                y={y + 44 - (34 + ((i * 7) % 9))}
                width={7}
                height={34 + ((i * 7) % 9)}
                rx={1}
                fill={colour}
              />
            ))}
            <rect x={16} y={y + 44} width={52} height={4} fill={WOOD} />
          </g>
        );
      })}
      <rect x={8} y={GROUND} width={236} height={10} fill={scene("floorboards")} />
      {/* books piled on the floor */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={226 - (i % 2) * 3} y={GROUND - 8 - i * 8} width={16} height={8} rx={1} fill={BOOKS[0][i]} />
      ))}
    </g>
  );
}

/** The desk: a laptop scrolling through documentation, an open book flipping its pages, a pile of printouts. */
type DeskProps = { searching: number };

function Desk({ searching }: DeskProps) {
  const flip = searching > 0 ? (searching % 0.8) / 0.8 : 0;
  const scroll = (searching * 10) % 7;
  return (
    <g>
      <rect x={76} y={200} width={112} height={7} rx={2} fill={WOOD} />
      <rect x={82} y={207} width={5} height={GROUND - 207} fill={WOOD_DARK} />
      <rect x={178} y={207} width={5} height={GROUND - 207} fill={WOOD_DARK} />
      {/* laptop */}
      <rect x={82} y={196} width={42} height={4} rx={1} fill={IRON} />
      <rect x={86} y={158} width={36} height={38} rx={2} fill={IRON} />
      <clipPath id="ai-docs">
        <rect x={89} y={161} width={30} height={32} />
      </clipPath>
      <rect x={89} y={161} width={30} height={32} fill={PAPER} />
      <g clipPath="url(#ai-docs)">
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={i}
            x1={92}
            y1={164 + i * 7 - scroll}
            x2={i % 3 === 0 ? 106 : 115}
            y2={164 + i * 7 - scroll}
            stroke={i % 3 === 0 ? BLUE : scene("thread")}
            strokeWidth={1.6}
          />
        ))}
      </g>
      {/* open book, a page turning over */}
      <Book x={150} y={190} colour={BLUE} />
      <path
        d="M0,0 L18,-4 L18,8 L0,12 Z"
        fill={PAPER}
        stroke={scene("thread")}
        strokeWidth={0.6}
        transform={`translate(150 190) scale(${Math.cos(flip * Math.PI)} 1)`}
      />
      {/* printouts */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={166 + (i % 2) * 2}
          y={186 - i * 3}
          width={20}
          height={14}
          rx={1}
          fill={PAPER}
          stroke={scene("thread")}
          strokeWidth={0.8}
        />
      ))}
    </g>
  );
}

/** Sheets lifting off the pile and drifting away, over and over while searching. */
type FlyingSheetsProps = { searching: number };

function FlyingSheets({ searching }: FlyingSheetsProps) {
  return (
    <g>
      {[0, 0.9].map((offset) => {
        const t = searching > 0 ? ((searching + offset) % 1.8) / 1.8 : 0;
        return (
          <g key={offset} opacity={searching > 0 ? Math.sin(t * Math.PI) : 0}>
            <Sheet x={176 - t * 50 - offset * 20} y={176 - t * 90} angle={-20 + t * 80 + offset * 30} lines={3} />
          </g>
        );
      })}
    </g>
  );
}

type SearcherProps = { searching: number };

function Searcher({ searching }: SearcherProps) {
  const scratch = searching > 0 ? Math.sin(searching * 9) * 10 : 0;
  const reach = searching > 0 ? Math.sin(searching * 4) * 6 : 0;
  return (
    <g>
      <rect x={196} y={218} width={36} height={6} rx={2} fill={WOOD_DARK} />
      <rect x={226} y={178} width={6} height={42} rx={2} fill={WOOD_DARK} />
      <rect x={200} y={224} width={4} height={GROUND - 224} fill={WOOD_DARK} />
      <rect x={224} y={224} width={4} height={GROUND - 224} fill={WOOD_DARK} />
      <Person
        x={210}
        facing={-1}
        seated
        shirt={scene("shirt-blue")}
        trousers={scene("trousers")}
        near={{ shoulder: 62 + reach, elbow: 30 }}
        far={{ shoulder: 170, elbow: 100 + scratch }}
        headwear={<Hair />}
      />
    </g>
  );
}

function BrightRoom() {
  return (
    <g>
      <rect x={256} y={40} width={236} height={GROUND - 40} rx={10} fill={WALL} />
      <circle cx={400} cy={120} r={100} fill="var(--accent-wash)" />
      <rect x={256} y={GROUND} width={236} height={10} fill={scene("floor-modern")} />
      {/* low cabinet */}
      <rect x={340} y={220} width={130} height={42} rx={3} fill={WOOD_LIGHT} />
      <line x1={405} y1={222} x2={405} y2={260} stroke={WOOD_DARK} strokeWidth={1} />
      <rect x={380} y={238} width={14} height={3} rx={1} fill={WOOD_DARK} />
      <rect x={416} y={238} width={14} height={3} rx={1} fill={WOOD_DARK} />
      <rect x={440} y={200} width={10} height={20} rx={1} fill={scene("cloth")} />
      <ellipse cx={445} cy={194} rx={5} ry={10} fill={scene("leaf")} />
      <ellipse cx={452} cy={198} rx={4} ry={8} fill={scene("leaf")} transform="rotate(30 452 198)" />
    </g>
  );
}

/** The AI: a glowing orb with a pulse ring and a sparkle. */
const ANSWER = [
  { width: 92, colour: BLUE },
  { width: 70, colour: GREEN },
  { width: 84, colour: WOOD },
  { width: 48, colour: BERRY },
];

/** The big screen: the person's question, the AI thinking, then its answer line by line. */
function ChatScreen() {
  const on = useProgress(BEAT.screen, 0.4);
  const ask = useProgress(BEAT.ask, 0.4);
  const thinkSince = useSince(BEAT.think);
  const thinking = thinkSince > 0 && thinkSince < BEAT.answer - BEAT.think;
  const answerSince = useSince(BEAT.answer);
  const answer = useProgress(BEAT.answer, 0.3);
  const orbSince = useSince(BEAT.screen);
  return (
    <g opacity={on}>
      <rect x={310} y={56} width={172} height={122} rx={6} fill={IRON} />
      <rect x={315} y={61} width={162} height={112} rx={3} fill={PAPER} />
      {/* the question */}
      <g opacity={ask} transform={`translate(0 ${(1 - ask) * 6})`}>
        <rect x={386} y={68} width={84} height={20} rx={8} fill="var(--accent-wash)" />
        <rect x={394} y={75} width={56} height={3.5} rx={1.5} fill={ACCENT} />
        <rect x={394} y={81} width={34} height={3.5} rx={1.5} fill={ACCENT} />
      </g>
      <Orb x={332} y={108} since={orbSince} size={0.9} />
      {thinking && (
        <g>
          <rect x={348} y={98} width={40} height={20} rx={8} fill={WALL} />
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              cx={358 + i * 10}
              cy={108}
              r={2.6}
              fill={SOFT}
              opacity={0.4 + 0.6 * Math.abs(Math.sin(thinkSince * 5 - i))}
            />
          ))}
        </g>
      )}
      {answer > 0 && (
        <g opacity={answer}>
          <rect x={348} y={96} width={120} height={70} rx={8} fill={WALL} />
          {ANSWER.map((line, i) => {
            const grown = Math.max(0, Math.min(1, (answerSince - i * 0.22) / 0.3));
            return (
              <rect key={i} x={356} y={106 + i * 14} width={line.width * grown} height={4} rx={2} fill={line.colour} />
            );
          })}
        </g>
      )}
    </g>
  );
}

function Director() {
  const shown = useProgress(BEAT.person, 0.5);
  const point = useProgress(BEAT.ask, 0.5);
  const nod = Math.sin(useSince(BEAT.answer) * 4) * 4;
  return (
    <g opacity={shown} transform={`translate(${(1 - shown) * -16} 0)`}>
      <Person
        x={282}
        facing={1}
        shirt={ACCENT}
        trousers={scene("trousers")}
        near={{ shoulder: 40 + point * 70 + nod * 0.5, elbow: -10 - point * 10 }}
        far={{ shoulder: 30, elbow: 70 }}
        headwear={<Hair colour={scene("belt")} />}
        outfit={<CrossPin />}
        farHolding={(hand) => <Clipboard hand={hand} />}
      />
    </g>
  );
}

export function AiScene() {
  const searching = Math.min(useSince(BEAT.search), TURN - BEAT.search);
  return (
    <SceneCanvas>
      <EraChip era={SHIFT.era} />
      <TwoWorlds
        id="ai"
        turnAt={TURN}
        old={
          <>
            <Study />
            <Searcher searching={searching} />
            <Desk searching={searching} />
            <FlyingSheets searching={searching} />
          </>
        }
        room={<BrightRoom />}
      >
        <ChatScreen />
        <Director />
      </TwoWorlds>
      <ShiftLabel at={BEAT.label} old={SHIFT.old} new={SHIFT.new} example={JOB_SHIFTS_EXAMPLE} />
    </SceneCanvas>
  );
}
