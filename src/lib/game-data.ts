export type ResourceId = "environment" | "people" | "army" | "money";

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
    character: "The Creator",
    imageId: "char-creator",
    text: "Pharaoh, I have returned. The fate of this land rests on your choices. The great river overflows, will you build dams or let it flood?",
    choices: [
      {
        text: "Build the dams.",
        effects: { money: -15, environment: 10, people: 5 },
      },
      {
        text: "Let the river flood.",
        effects: { environment: -15, people: -10 },
      },
    ],
  },
  {
    id: 2,
    character: "High Priest",
    imageId: "char-priest",
    text: "A strange star has appeared in the sky. The people are frightened. Should we hold a grand ceremony to appease the gods, or consult the astronomers?",
    choices: [
      {
        text: "Hold a ceremony.",
        effects: { people: 15, money: -10 },
      },
      {
        text: "Consult the astronomers.",
        effects: { people: -5, army: 5, environment: 5 },
      },
    ],
  },
  {
    id: 3,
    character: "General",
    imageId: "char-general",
    text: "The northern tribes are restless. A show of force will keep them in line, but it may provoke a larger conflict.",
    choices: [
      {
        text: "Send a legion to the border.",
        effects: { army: 15, money: -10 },
      },
      {
        text: "Attempt diplomacy.",
        effects: { army: -10, money: -5, people: 5 },
      },
    ],
  },
  {
    id: 4,
    character: "Treasurer",
    imageId: "char-treasurer",
    text: "The royal granaries are overflowing. We can sell the surplus for a great profit, or distribute it to the people to ensure their loyalty.",
    choices: [
      {
        text: "Sell the surplus.",
        effects: { money: 20, people: -10 },
      },
      {
        text: "Distribute it to the people.",
        effects: { money: -10, people: 15 },
      },
    ],
  },
  {
    id: 5,
    character: "Mysterious Stranger",
    imageId: "char-stranger",
    text: "I offer you a glimpse of the future, a device that can predict the harvest. It will make your kingdom prosperous, but its power is not without cost.",
    choices: [
      {
        text: "Accept the device.",
        effects: { money: 20, environment: 10, army: -5, people: -5 },
      },
      {
        text: "Refuse his offer.",
        effects: { army: 5 },
      },
    ],
  },
  {
    id: 6,
    character: "Chief Architect",
    imageId: "char-architect",
    text: "Great Pharaoh, we can build a grand monument to your glory. It will be a marvel, but will require immense resources.",
    choices: [
      {
        text: "Build the monument!",
        effects: { people: 20, money: -25, army: -5 },
      },
      {
        text: "Our resources are needed elsewhere.",
        effects: { people: -5, army: 5 },
      },
    ],
  },
  {
    id: 7,
    character: "Foreign Emissary",
    imageId: "char-emissary",
    text: "My kingdom offers a trade alliance. It will bring wealth, but also make us dependent on foreign goods.",
    choices: [
      {
        text: "Accept the alliance.",
        effects: { money: 20, army: -10 },
      },
      {
        text: "We will remain self-sufficient.",
        effects: { money: -5, army: 5 },
      },
    ],
  },
  {
    id: 8,
    character: "Head Farmer",
    imageId: "char-farmer",
    text: "A plague of locusts threatens the crops. We need soldiers to help, but it will leave our borders vulnerable.",
    choices: [
      {
        text: "Divert the soldiers.",
        effects: { environment: 15, army: -15, people: 10 },
      },
      {
        text: "The army must hold its position.",
        effects: { environment: -20, people: -15 },
      },
    ],
  },
  {
    id: 9,
    character: "General",
    imageId: "char-general",
    text: "My soldiers' morale is low. A pay rise would boost their spirits, but the treasury is already strained.",
    choices: [
      {
        text: "Give them a raise.",
        effects: { army: 15, money: -15 },
      },
      {
        text: "They must serve for glory.",
        effects: { army: -15 },
      },
    ],
  },
  {
    id: 10,
    character: "High Priest",
    imageId: "char-priest",
    text: "The people grow restless with our old traditions. A new festival could unite them, or it could be seen as heresy.",
    choices: [
      {
        text: "Announce the new festival.",
        effects: { people: 15, money: -5 },
      },
      {
        text: "Uphold the old ways.",
        effects: { people: -10, army: 5 },
      },
    ],
  },
];

export const gameOverConditions: Record<string, string> = {
  environment_low: "The land has withered and can no longer sustain your people. Your reign ends in famine.",
  environment_high: "Nature has reclaimed your kingdom. Your cities are lost to the sands.",
  people_low: "The people have revolted, and you have been overthrown.",
  people_high: "Your people's adoration has turned to fanaticism, leading to the collapse of society.",
  army_low: "Your kingdom, defenseless, has been conquered by invaders.",
  army_high: "The army has seized control in a military coup. Your rule is over.",
  money_low: "The kingdom is bankrupt. Your authority crumbles as chaos ensues.",
  money_high: "Economic collapse due to extreme inflation has brought your reign to an end.",
};
