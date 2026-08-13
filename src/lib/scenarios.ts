import type {
  CheckDraft,
  MapDraft,
  RehearseDraft,
  RepairDraft,
} from "@/lib/schemas/input";

export type Scenario = {
  id: string;
  label: string;
  blurb: string;
  check: CheckDraft;
};

/** The canonical example, used by the homepage CTA and the Check "Try an example" button. */
export const EXAMPLE_CHECK: CheckDraft = {
  relationship: "Spouse",
  context:
    "We planned dinner tonight but he cancelled because work came up again. I want him to understand that repeatedly cancelling affects me without turning it into a huge fight.",
  message:
    "Whatever. Don't worry about coming over tonight. Clearly work is more important.",
  outcome: "Be understood",
};

export const SCENARIOS: Scenario[] = [
  {
    id: "cancelled-plans",
    label: "Cancelled plans",
    blurb: "I want them to understand I'm disappointed.",
    check: EXAMPLE_CHECK,
  },
  {
    id: "feeling-ignored",
    label: "Feeling ignored",
    blurb: "I don't want to sound needy, but I need more communication.",
    check: {
      relationship: "Dating",
      context:
        "We've been seeing each other for two months and she goes quiet for days at a time. I don't want to seem clingy, but I'd like to know where I stand.",
      message:
        "hey, guess you've been busy. no worries if you're not feeling this anymore, just let me know either way I guess",
      outcome: "Be more direct",
    },
  },
  {
    id: "setting-a-boundary",
    label: "Setting a boundary",
    blurb: "I need to say no without turning this into a fight.",
    check: {
      relationship: "Family",
      context:
        "My mum wants to stay with us for three weeks over the holidays. It's too long for our flat and it always ends badly, but I don't want to hurt her.",
      message:
        "Three weeks is a lot mum. I mean if you really want to come I'm not going to stop you, but you know what it was like last time.",
      outcome: "Set a boundary",
    },
  },
  {
    id: "repairing-an-argument",
    label: "Repairing an argument",
    blurb: "I was harsher than I meant to be.",
    check: {
      relationship: "Partner",
      context:
        "We argued about money last night and I said something about her spending that I didn't mean the way it came out. I want to fix it without pretending the money issue doesn't exist.",
      message:
        "Sorry about last night, I was stressed. But you have to admit I had a point about the card.",
      outcome: "Repair things",
    },
  },
  {
    id: "asking-directly",
    label: "Asking directly",
    blurb: "I keep hinting at what I need instead of actually saying it.",
    check: {
      relationship: "Work",
      context:
        "I've been doing the lead work on this project for four months without the title or pay. I want to ask my manager to make it official.",
      message:
        "Just wondering if there's any update on the role stuff we talked about? No rush obviously, whenever you get a chance.",
      outcome: "Ask for something",
    },
  },
];

export const EXAMPLE_MAP: MapDraft = {
  relationship: "Partner",
  whatHappened:
    "We've had the same argument about chores three times this month. I end up doing most of the cleaning, then I get quiet about it, then it comes out all at once and he says I never told him anything was wrong.",
  wantUnderstood:
    "That it isn't about the dishes. It's that I'm the one keeping track of everything and that's exhausting on its own.",
  theirWant:
    "I think he wants to feel like he isn't failing, and to be told what to do rather than guess.",
  extra:
    "He does help when I ask. Asking is the part that wears me down.",
};

export const EXAMPLE_REPAIR: RepairDraft = {
  relationship: "Friend",
  whatHappened:
    "She told me she'd been struggling and I made a joke about it in front of other people at dinner. She went quiet and left early. We haven't spoken in four days.",
  youSaid:
    "I said something like 'well at least one of us has a personality crisis to keep things interesting'.",
  theySaid: "Nothing at the time. Later she texted 'that wasn't ok'.",
  regret:
    "Saying it in front of people, and then defending it as a joke instead of just stopping.",
  wantNow:
    "I want her to know I understood why it landed badly, and I want the friendship back.",
};

export const EXAMPLE_REHEARSE: RehearseDraft = {
  relationship: "Work",
  situation:
    "I need to tell my manager I can't take on the second project. I've said yes to everything for a year and I'm behind on the work that actually matters.",
  person:
    "He's friendly but he tends to reframe a no as a scheduling problem and talk me back into it.",
  goal: "Say no to the second project and keep it a no.",
  difficulty: "Defensive",
};
