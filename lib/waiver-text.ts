import { EVENT } from "./event";
import { WAIVER_VERSION } from "./waiver";

/**
 * The words participants and guardians agree to at /waiver.
 *
 * A TEMPLATE, NOT LEGAL ADVICE. Written Nov 19, 2026 and revised Nov 20,
 * 2026 after a review, for a free, one-day, no-overnight event for high
 * school students. Before collecting real signatures, have a California
 * attorney read it alongside the venue agreement, the HCB fiscal
 * sponsorship agreement and the event insurance, and confirm that The Hack
 * Foundation, the venue and organizers' parents may be named as Released
 * Parties. Change WAIVER_VERSION in lib/waiver.ts with any edit to these
 * words.
 *
 * Text between ** marks is shown in bold, so the release of negligence
 * claims is conspicuous, as California courts expect.
 */

const HOST = EVENT.venue.name ?? "the venue host";

/** The people the release protects. */
const RELEASED = `Beacon Hacks and its organizers (including student organizers), volunteers, staff and representatives, and their parents or guardians while helping to run the event; The Hack Foundation (Hack Club), as Beacon Hacks' fiscal sponsor; ${HOST} and the venue's owners and operators; and the event's sponsors, judges and mentors and their authorized representatives (together, the "Released Parties")`;

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
      `${EVENT.name} is a one-day hackathon on ${EVENT.date.label} at ${EVENT.venue.place ?? EVENT.venue.label}, ${EVENT.venue.city}, from ${EVENT.hours.label}, run by student organizers and adult volunteers (the "Organizers"). Taking part means building software and simple hardware, using computers, cables, chargers, batteries, small electronic components and hand tools, eating food prepared or supplied by others, and moving around crowded rooms shared with other participants.`,
      "These activities carry risks, including cuts, burns, electric shock, trips and falls, allergic reactions (including to food that contains allergens or has touched them), illness, exposure to communicable diseases, and the loss of or damage to personal belongings. Food may come from caterers and sponsors, and Beacon Hacks cannot guarantee an allergen-free environment.",
      "The participant will follow all safety instructions. Not allowed at the event: soldering irons, heat guns or open flames; wiring that connects to wall power, other than a store-bought device used as intended; large lithium battery packs, such as e-bike, scooter or drone batteries; and blades or power tools. The Organizers may stop any activity or remove any equipment they consider unsafe.",
      "Taking part is voluntary. The participant, and for a participant under 18 the parent or guardian, understands these risks and accepts them.",
      `To the fullest extent California law allows, the participant, and for a participant under 18 the parent or legal guardian signing on the participant's behalf, voluntarily release and discharge ${RELEASED} from all claims arising out of the participant's involvement in the event, **including claims caused by the ordinary negligence of the Released Parties**. This covers claims for personal injury, illness, property damage, property loss and other losses connected with the event, including taking part in its activities, using the facilities, eating food served there and using permitted equipment.`,
      "This release does not cover gross negligence, reckless conduct or willful misconduct, or any liability that California law does not allow to be released.",
    ],
  },
  {
    id: "medical",
    title: "Medical authorization",
    paragraphs: [
      "If the participant is hurt or falls ill during the event, the Organizers may give basic first aid and may call emergency services whenever they reasonably believe medical help is needed. If a parent or guardian cannot be reached, the parent or guardian authorizes emergency medical treatment that a licensed provider considers necessary.",
      "The Organizers and volunteers are not necessarily medical professionals and cannot guarantee immediate treatment. Emergency responders and licensed providers make their own treatment decisions. The Organizers do not give out medication: a participant who needs their own, such as an inhaler or epinephrine auto-injector, brings it and keeps it with them.",
      "The parent or guardian (or the adult participant) is responsible for the cost of any treatment. The signer has given accurate information on this form about any serious allergies or medical needs the Organizers should know about to respond in an emergency; it is shared only with organizers who need it and with the people treating the participant.",
    ],
  },
  {
    id: "conduct",
    title: "Code of conduct, supervision and the day",
    paragraphs: [
      `The participant will follow the Beacon Hacks code of conduct (${EVENT.url}/code-of-conduct) and the instructions of organizers and venue staff. Bullying, harassment, unsafe use of equipment, or leaving without telling an organizer can mean removal from the event. For a participant under 18, a parent or guardian is called and the participant waits with an organizer until they are picked up or the parent or guardian says how they will get home.`,
      "Beacon Hacks is a supervised group event, not childcare or a custodial service. The Organizers and designated adult volunteers supervise the event as a whole, but participants will not have one-on-one supervision at all times. Participants stay within the event areas and tell an organizer before leaving the venue, for any reason and at any time.",
      "Every participant checks in on arrival, and only with a completed waiver: for a participant under 18, that means a parent or guardian has signed. Beacon Hacks does not provide transportation or overnight accommodation, and parents and guardians arrange safe travel to and from the event. A participant under 18 leaves only in the way their parent or guardian chose on this form. The event ends by 11 PM.",
      "The participant is responsible for their own laptop, devices and belongings.",
    ],
  },
  {
    id: "privacy",
    title: "How we use this information",
    paragraphs: [
      "The Organizers use this form only to run the event and keep people safe: to review and confirm it by email, check people in and out, plan food around allergies and diets, and reach a parent, guardian or emergency contact.",
      "Health details are seen only by organizers who need them and by anyone giving treatment, never by sponsors or general volunteers. The participant's email may be given to a sponsor only to deliver a perk the participant can claim, such as software credits, and never for marketing. Nothing on this form is sold.",
      "Registration records, signed waivers and related documents are kept as long as reasonably necessary for running the event, safety, insurance and legal obligations. Health information is kept only as long as reasonably necessary, with access restricted. To see or correct a record, write to " + EVENT.email.team + ".",
    ],
  },
  {
    id: "media",
    title: "Photos and video",
    paragraphs: [
      "Organizers take photos and short videos during the event and may use them on the Beacon Hacks website and social media, and in materials for future events and sponsors. No one is named in a photo without permission.",
      "Answer yes or no below. A no is fine: the participant gets a no-photos sticker on their badge at check-in, photographers are told to leave them out, and any published photo they appear in is taken down on request.",
    ],
  },
];

export const ESIGN =
  "Signing below, by drawing a signature or typing a full name, is an electronic signature with the same effect as a handwritten one. The signer has read this waiver, understands it, and agrees to it.";

/**
 * What a parent or legal guardian confirms when they sign for a
 * participant under 18: authority, permission to attend, and agreement on
 * the child's behalf. Shown above their signature in every way they can
 * sign (on the device, from the emailed link, or on paper).
 */
export function guardianConsent(child = "the minor participant named above") {
  return [
    `I certify that I am the parent or legal guardian of ${child} and have legal authority to give this consent.`,
    `I give permission for my child to attend and take part in ${EVENT.name} on ${EVENT.date.label}. I have read the event activities, risks, release of liability (including for ordinary negligence), medical authorization, code of conduct, supervision terms and departure arrangement on this form.`,
    "I understand my child will take part in a group event with other students, volunteers, mentors and organizers. I agree to this waiver for myself and on my child's behalf, to the extent the law allows, and the information on this form is correct.",
  ];
}

export const WAIVER_FOOTER = `Beacon Hacks participant waiver, version ${WAIVER_VERSION}.`;
