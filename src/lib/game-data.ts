export type ResourceId = "military" | "treasury" | "publicApproval" | "technology";

export interface Choice {
  text: string;
  effects: Partial<Record<ResourceId, number>>;
}

export interface CardData {
  id: number;
  character: string;
  imageId: string;
  text: string;
  choices: [Choice, Choice];
}

export const INITIAL_RESOURCE_VALUE = 50;

export const gameCards: CardData[] = [
  {
    id: 1,
    character: "General Kael",
    imageId: "char-kael",
    text: "Commander, our intelligence reports a neighboring state is mobilizing troops near our border. A pre-emptive strike could neutralize the threat, but it would be costly.",
    choices: [
      {
        text: "Launch the strike.",
        effects: { military: 15, treasury: -20, publicApproval: -5 },
      },
      {
        text: "Reinforce our borders.",
        effects: { military: -10, treasury: -10 },
      },
    ],
  },
  {
    id: 2,
    character: "Finance Minister Valerius",
    imageId: "char-valerius",
    text: "The new cybernetics program is over budget. We can divert funds from social welfare to cover the costs, or scale back the project.",
    choices: [
      {
        text: "Fund the program fully.",
        effects: { technology: 20, publicApproval: -15, treasury: -10 },
      },
      {
        text: "Scale it back.",
        effects: { technology: -10, treasury: 5 },
      },
    ],
  },
  {
    id: 3,
    character: "Media Mogul Cyra",
    imageId: "char-cyra",
    text: "Public sentiment is turning against the government's surveillance network. A PR campaign could boost your image, or we could dismantle some of the more invasive systems.",
    choices: [
      {
        text: "Launch the PR campaign.",
        effects: { publicApproval: 15, treasury: -10 },
      },
      {
        text: "Dismantle invasive systems.",
        effects: { publicApproval: 10, technology: -15, military: -5 },
      },
    ],
  },
  {
    id: 4,
    character: "Chief Scientist Elara",
    imageId: "char-elara",
    text: "We've developed a breakthrough in AI-driven manufacturing! It could automate thousands of jobs, boosting our economy but causing mass unemployment.",
    choices: [
      {
        text: "Deploy the AI immediately.",
        effects: { technology: 15, treasury: 20, publicApproval: -20 },
      },
      {
        text: "Phase it in slowly with retraining.",
        effects: { technology: 5, treasury: -10, publicApproval: 5 },
      },
    ],
  },
  {
    id: 5,
    character: "Ambassador Zoric",
    imageId: "char-zoric",
    text: "The Outer Rim colonies are requesting aid after a solar flare. Sending supplies would be a great act of diplomacy but will strain our resources.",
    choices: [
      {
        text: "Send a generous aid package.",
        effects: { publicApproval: 15, treasury: -15, technology: 5 },
      },
      {
        text: "Send a token amount.",
        effects: { publicApproval: -10, military: -5 },
      },
    ],
  },
];

export const gameOverConditions: Record<string, string> = {
  military_low: "Your weakened military was overrun by rivals. Your nation has fallen.",
  military_high: "The military has seized power in a coup, ending your rule.",
  treasury_low: "The nation is bankrupt. Riots in the streets have overthrown your government.",
  treasury_high: "Rampant inflation and wealth disparity have collapsed the economy. You are deposed.",
  publicApproval_low: "The people have risen up against you. You are exiled in disgrace.",
  publicApproval_high: "A cult of personality has formed around you, but your sycophantic followers have made governance impossible.",
  technology_low: "Your nation has fallen into a dark age, unable to compete with its technologically superior neighbors.",
  technology_high: "Your pursuit of technology has led to a singularity event. Humanity is now governed by a rogue AI. You are obsolete.",
};
