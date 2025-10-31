
export type ResourceId = "environment" | "people" | "army" | "money";
export type StoryFlag = 
  | "studied_star" 
  | "met_astronomer"
  | "creator_github_mercy"
  | "creator_linkedin_prescience";

export interface Choice {
  text: string;
  effects: Partial<Record<ResourceId, number>>;
  setFlag?: StoryFlag;
  action?: () => void;
}

export interface CardData {
  id: number;
  character: string;
  imageId: string;
  text: string;
  choices: [Choice, Choice];
  isSpecial?: boolean; // To identify special event cards
  requiredFlags?: StoryFlag[]; // Card only appears if these flags are set
  blockedByFlags?: StoryFlag[]; // Card is blocked if these flags are set
}

export const INITIAL_RESOURCE_VALUE = 50;

export const gameCards: CardData[] = [
  {
    id: 1,
    character: "The Advisor",
    imageId: "char-priest",
    text: "Pharaoh, the great river overflows. Should we invest in strengthening the dams or conserve our resources and let it flood?",
    choices: [
      {
        text: "Strengthen the dams.",
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
    text: "A strange celestial body hangs in the sky. The people are frightened. Should we hold a grand ceremony to appease the gods, or consult the astronomers?",
    choices: [
      {
        text: "Hold a ceremony.",
        effects: { people: 15, money: -10 },
      },
      {
        text: "Consult the astronomers.",
        effects: { people: -5, army: 5 },
        setFlag: "met_astronomer",
      },
    ],
    blockedByFlags: ["met_astronomer"],
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
  {
    id: 11,
    character: "Lead Astronomer",
    imageId: "char-astronomer",
    text: "You summoned me, Pharaoh. The celestial body is no star. It is a vessel. It is waiting.",
    choices: [
      {
        text: "A vessel? For what?",
        effects: { people: 5, army: 5, environment: 5, money: 5},
      },
      {
        text: "This is nonsense. Leave.",
        effects: { people: -5 },
      },
    ],
    requiredFlags: ["met_astronomer"],
    blockedByFlags: ["studied_star"],
  },
  {
    id: 201,
    character: "Lead Astronomer",
    imageId: "char-astronomer",
    text: "Pharaoh, the star... it speaks. It offers knowledge beyond our comprehension, a power to reshape the world. But it demands a sacrifice to merge with it.",
    choices: [
      {
        text: "Embrace the power.",
        effects: { environment: 50, people: -50, army: 50, money: 50 },
      },
      {
        text: "This is madness. Destroy it!",
        effects: { army: -20 },
      },
    ],
    requiredFlags: ["studied_star"],
  },
  {
    id: 302,
    character: "Harshrajsinh Raulji",
    imageId: "char-creator",
    text: "Your reign is... faltering. I am the Creator of this world. Follow my work on GitHub, and I shall grant you a second chance.",
    choices: [
      {
        text: "Open GitHub & accept.",
        effects: {},
        setFlag: "creator_github_mercy",
        action: () => window.open('https://github.com/harshrajsinhraulji', '_blank'),
      },
      {
        text: "I refuse your help.",
        effects: {},
      },
    ],
    isSpecial: true,
  },
  {
    id: 303,
    character: "Harshrajsinh Raulji",
    imageId: "char-creator",
    text: "We meet again. Your progress is impressive. As a reward, connect with me on LinkedIn and I will grant you foresight for a decade.",
    choices: [
      {
        text: "Open LinkedIn & accept.",
        effects: {},
        setFlag: "creator_linkedin_prescience",
        action: () => window.open('https://www.linkedin.com/in/harshrajsinhraulji', '_blank'),
      },
      {
        text: "I need no such gift.",
        effects: { people: -5 },
      },
    ],
    isSpecial: true,
    requiredFlags: ["creator_github_mercy"],
    blockedByFlags: ["creator_linkedin_prescience"],
  },
];


export const specialEventCards: CardData[] = [
    {
    id: 101,
    character: "Mysterious Stranger",
    imageId: "char-stranger",
    text: "I offer you a glimpse of the future, a device that can predict the harvest. It will make your kingdom prosperous, but its power is not without cost.",
    choices: [
      {
        text: "Accept the device.",
        effects: { money: 25, environment: 15, army: -10, people: -10 },
      },
      {
        text: "Refuse his offer.",
        effects: { army: 5 },
      },
    ],
    isSpecial: true,
  },
  {
    id: 102,
    character: "The Creator",
    imageId: "char-creator",
    text: "A great flood is coming. I can save your people, but you must cede all authority to me for one cycle. Trust me, or trust your own strength?",
    choices: [
        {
            text: "I trust you.",
            effects: { people: 40, army: -20, money: -20, environment: -20},
        },
        {
            text: "We will save ourselves.",
            effects: { people: -30, environment: -30},
        }
    ],
    isSpecial: true,
  },
  {
    id: 103,
    character: "Fallen Star",
    imageId: "char-creator",
    text: "A star has fallen from the sky, landing in the desert. It radiates a strange energy. Should we study it or destroy it?",
    choices: [
      {
        text: "Study the star.",
        effects: { environment: 20, people: -10, money: -10, army: 10 },
        setFlag: "studied_star",
      },
      {
        text: "Destroy it.",
        effects: { army: -15, people: 10 },
      },
    ],
    isSpecial: true,
  }
]

export const gameOverConditions: Record<string, string> = {
  environment_low: "The land has withered and can no longer sustain your people. Your reign ends in famine.",
  environment_high: "Nature has reclaimed your kingdom. Your cities are lost to the sands.",
  people_low: "The people have revolted, and you have been overthrown.",
  people_high: "Your people's adoration has turned to fanaticism, leading to the collapse of society.",
  army_low: "Your kingdom, defenseless, has been conquered by invaders.",
  army_high: "The army has seized control in a military coup. Your rule is over.",
  money_low: "The kingdom is bankrupt. Your authority crumbles as chaos ensues.",
  money_high: "Economic collapse due to extreme inflation has brought your reign to an end.",
  studied_star_ending: "You merged with the cosmic entity. You are no longer human, but a god. Your kingdom is a paradise of crystalline thought, but the laughter of children is never heard again. You have won, but at what cost?",
};
