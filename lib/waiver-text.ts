import { EVENT } from "./event";
import { WAIVER_VERSION } from "./waiver";

/**
 * The words participants and guardians agree to at /waiver.
 *
 * A TEMPLATE, NOT LEGAL ADVICE. Written Nov 19, 2026 for a free, one-day,
 * no-overnight event for high school students. Before collecting real
 * signatures, have it read by someone qualified, and check whether HCB /
 * The Hack Foundation or the venue (Cupertino Odd Fellows Lodge #70) asks
 * for their own waiver or for their names here. Change WAIVER_VERSION in
 * lib/waiver.ts with any edit to these words.
 */

const HOST = EVENT.venue.name ?? "the venue host";
const RELEASED = `the Beacon Hacks organizers and volunteers; The Hack Foundation (Hack Club), Beacon Hacks' fiscal sponsor; ${HOST}; and the event's sponsors, judges and mentors (together, "the Organizers")`;

export type Clause = {
  id: "release" | "medical" | "conduct" | "privacy" | "media";
  title: string;
  paragraphs: string[];
};

export const CLAUSES: Clause[] = [
  {
    id: "release",
    title: "Assumption of risk and release",
    paragraphs: [
      `${EVENT.name} is a one-day hackathon on ${EVENT.date.label} at ${EVENT.venue.place ?? EVENT.venue.label}, ${EVENT.venue.city}, from ${EVENT.hours.label}. Taking part means building software and hardware, using computers, tools and electronics, eating food served at the event, and moving around a shared space with other people.`,
      "These activities carry risks, including trips and falls, minor cuts or burns from hardware, allergic reactions, illness and the loss of or damage to personal property. Taking part is voluntary, and the participant accepts these risks.",
      `To the fullest extent the law allows, the participant, and for a participant under 18 the parent or guardian signing below, release ${RELEASED} from claims for injury, illness, loss or damage arising from taking part, except where caused by gross negligence or willful misconduct.`,
    ],
  },
  {
    id: "medical",
    title: "Medical authorization",
    paragraphs: [
      "If the participant is hurt or falls ill during the event, the Organizers may give first aid and may call emergency services. If a parent or guardian cannot be reached, the parent or guardian authorizes emergency medical treatment that a licensed provider considers necessary.",
      "The parent or guardian (or the adult participant) is responsible for the cost of any treatment. The health information on this form is accurate to the best of the signer's knowledge and is shared only with the people treating the participant.",
    ],
  },
  {
    id: "conduct",
    title: "Code of conduct and the day",
    paragraphs: [
      `The participant will follow the Beacon Hacks code of conduct (${EVENT.url}/code-of-conduct) and the instructions of organizers and venue staff. Anyone who breaks it may be asked to leave, and a minor's parent or guardian will be called.`,
      "The participant checks in on arrival and tells an organizer before leaving early. Beacon Hacks does not provide transport: the participant, or the parent or guardian, arranges getting there and home. The event ends by 11 PM and there is no overnight stay.",
      "The participant is responsible for their own laptop, devices and belongings.",
    ],
  },
  {
    id: "privacy",
    title: "How we use this information",
    paragraphs: [
      "The Organizers use this form only to run the event and keep people safe: to check people in, plan food around allergies and diets, and reach a parent, guardian or emergency contact.",
      "Health details are seen only by organizers who need them and by anyone giving treatment. The participant's email may be given to a sponsor only to deliver a perk the participant can claim, such as software credits. Nothing on this form is sold.",
      "The Organizers delete these records within a year of the event, unless the law or an incident report requires keeping them longer. To see or correct a record, write to " + EVENT.email.team + ".",
    ],
  },
  {
    id: "media",
    title: "Photos and video",
    paragraphs: [
      "Organizers take photos and short videos during the event and may use them on the Beacon Hacks website and social media, and in materials for future events and sponsors. No one is named in a photo without permission.",
      "Answer yes or no below. A no is fine: tell the check-in desk and we will do our best to keep the participant out of published images.",
    ],
  },
];

export const ESIGN =
  "Signing below, by drawing a signature or typing a full name, is an electronic signature with the same effect as a handwritten one. The signer has read this waiver, understands it, and agrees to it.";

export const WAIVER_FOOTER = `Beacon Hacks participant waiver, version ${WAIVER_VERSION}.`;
