export type ResourceId = "environment" | "people" | "army" | "money";
export type StoryFlag = 
  | "studied_star" 
  | "met_astronomer"
  | "creator_github_mercy"
  | "creator_linkedin_prescience"
  | "plague_allowed_ship"
  | "plague_started"
  | "plague_cured_by_sacrifice"
  | "plague_cured_by_isolation";

export interface Choice {
  text: string;
  effects: Partial<Record<ResourceId, number>>;
  setFlag?: StoryFlag;
  action?: () => void;
}

interface TextVariant {
  text: string;
  lowResource?: ResourceId;
  highResource?: ResourceId;
}

export interface CardData {
  id: number;
  character: string;
  imageId: string;
  text: string | TextVariant[];
  choices: [Choice, Choice];
  isSpecial?: boolean; // To identify special event cards
  requiredFlags?: StoryFlag[]; // Card only appears if these flags are set
  blockedByFlags?: StoryFlag[]; // Card is blocked if these flags are set
}

export const INITIAL_RESOURCE_VALUE = 50;
const LOW_RESOURCE_THRESHOLD = 30;
const HIGH_RESOURCE_THRESHOLD = 70;

export const getCardText = (card: CardData, resources: Record<ResourceId, number>): string => {
  if (typeof card.text === 'string') {
    return card.text;
  }

  // Check for a specific high-resource text
  const highResourceVariant = card.text.find(variant => 
    variant.highResource && resources[variant.highResource] > HIGH_RESOURCE_THRESHOLD
  );
  if (highResourceVariant) {
    return highResourceVariant.text;
  }

  // Check for a specific low-resource text
  const lowResourceVariant = card.text.find(variant => 
    variant.lowResource && resources[variant.lowResource] < LOW_RESOURCE_THRESHOLD
  );
  if (lowResourceVariant) {
    return lowResourceVariant.text;
  }

  // Fallback to the default text (the one without resource conditions)
  const defaultText = card.text.find(variant => !variant.lowResource && !variant.highResource);
  return defaultText ? defaultText.text : "You are the ruler of a forgotten kingdom. Your choices will determine its fate.";
};

export const gameCards: CardData[] = [
  {
    id: 0,
    character: "Tutorial",
    imageId: "char-scribe",
    text: "You are the ruler. Your choices shape the kingdom. Swipe left or right to decide its fate.",
    choices: [
        {
            text: "Drag Left",
            effects: {},
        },
        {
            text: "Drag Right",
            effects: {},
        },
    ]
  },
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
    text: [
      {
        text: "Pharaoh, with the coffers overflowing, now is the time to reward our soldiers. A bonus would ensure their loyalty for years to come.",
        highResource: "money"
      },
      {
        text: "My soldiers' morale is low. A pay rise would boost their spirits, but the treasury is already strained.",
      },
       {
        text: "Pharaoh, my soldiers starve. They cannot fight on glory alone. We must find the funds to pay them, or they will desert.",
        lowResource: "money"
      },
    ],
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
    id: 12,
    character: "Cult Leader",
    imageId: "char-cultist",
    text: "The people flock to my teachings, seeking solace. Embrace our movement, and they will be yours. Suppress us, and risk their wrath.",
    choices: [
      {
        text: "Embrace the new cult.",
        effects: { people: 20, army: -10 },
      },
      {
        text: "This is heresy. Arrest them.",
        effects: { people: -15, army: 10 },
      },
    ],
  },
  {
    id: 13,
    character: "Chief Alchemist",
    imageId: "char-alchemist",
    text: "Pharaoh, my guild is on the verge of a breakthrough: turning lead into gold! We require a significant investment to complete our Great Work.",
    choices: [
      {
        text: "Fund their research.",
        effects: { money: -20, environment: 10 },
      },
      {
        text: "This is folly. No more funds.",
        effects: { money: 5, people: -5 },
      },
    ],
  },
  {
    id: 14,
    character: "General",
    imageId: "char-general",
    text: "Bandits are raiding caravans on the spice road. We can send a detachment, but it will thin our defenses.",
    choices: [
      {
        text: "Secure the trade routes.",
        effects: { money: 10, army: -15 },
      },
      {
        text: "The merchants must protect themselves.",
        effects: { money: -10, people: -5 },
      },
    ],
  },
  {
    id: 15,
    character: "Scribe",
    imageId: "char-scribe",
    text: "I have found an ancient map in the library. It supposedly leads to a hidden oasis, a source of great vitality for the land.",
    choices: [
      {
        text: "Mount an expedition.",
        effects: { environment: 20, money: -10 },
      },
      {
        text: "It is likely a myth. Ignore it.",
        effects: { people: -5 },
      },
    ],
  },
  {
    id: 16,
    character: "Philosopher",
    imageId: "char-philosopher",
    text: "I have been teaching the youth to question everything, even your divine right to rule. This new way of thinking could lead to innovation or chaos.",
    choices: [
      {
        text: "Encourage this new philosophy.",
        effects: { people: 15, army: -10 },
      },
      {
        text: "Silence this dangerous thinker.",
        effects: { people: -10, army: 5 },
      },
    ],
  },
  {
    id: 17,
    character: "Merchant Captain",
    imageId: "char-merchant",
    text: "A ship from a distant, plagued land requests to dock. Their cargo is valuable, but they carry risk.",
    choices: [
      {
        text: "Allow them to dock.",
        effects: { money: 20, people: -5 },
        setFlag: "plague_allowed_ship"
      },
      {
        text: "Turn them away.",
        effects: { money: -5, army: 5 },
      },
    ],
    blockedByFlags: ["plague_started"]
  },
  {
    id: 18,
    character: "Plague Doctor",
    imageId: "char-plaguedoctor",
    text: "The sickness spreads. I can devise a cure, but it requires a rare, toxic flower that will poison the rivers.",
    choices: [
      {
        text: "The sacrifice is necessary.",
        effects: { people: 30, environment: -30 },
        setFlag: "plague_cured_by_sacrifice"
      },
      {
        text: "Find another way.",
        effects: { people: -10 },
      },
    ],
    requiredFlags: ["plague_started"],
    blockedByFlags: ["plague_cured_by_sacrifice", "plague_cured_by_isolation"]
  },
  {
    id: 19,
    character: "Quarantine Guard",
    imageId: "char-guard",
    text: "To stop the plague, we must lock the sick in their homes. It is brutal, but it will work.",
    choices: [
      {
        text: "Enforce the quarantine.",
        effects: { people: -20, army: 10 },
        setFlag: "plague_cured_by_isolation"
      },
      {
        text: "Show mercy.",
        effects: { people: 5, army: -5 },
      },
    ],
    requiredFlags: ["plague_started"],
    blockedByFlags: ["plague_cured_by_sacrifice", "plague_cured_by_isolation"]
  },
  {
    id: 20,
    character: "Royal Spy",
    imageId: "char-spy",
    text: "I have uncovered a plot against you within the court. We can expose the traitors publicly or... arrange for them to disappear.",
    choices: [
      {
        text: "Public trials for the traitors.",
        effects: { people: 10, army: -5 },
      },
      {
        text: "Make them disappear.",
        effects: { people: -10, army: 10 },
      },
    ],
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
  },
  {
    id: 104,
    character: "Oracle",
    imageId: "char-oracle",
    text: "A terrible sickness festers in a distant land. It travels on the winds and the water. Heed my warning, Pharaoh.",
    choices: [
      {
        text: "Prepare the kingdom.",
        effects: { army: 10, money: -10 },
        setFlag: "plague_started",
      },
      {
        text: "This is but a prophecy.",
        effects: { people: 5 },
      },
    ],
    isSpecial: true,
    blockedByFlags: ["plague_started"]
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

export const storyFlagDescriptions: Record<StoryFlag, string> = {
  studied_star: "You chose to study the fallen star, unlocking cosmic secrets.",
  met_astronomer: "You have consulted with the royal astronomers.",
  creator_github_mercy: "The Creator, Harshrajsinh Raulji, granted you a second chance.",
  creator_linkedin_prescience: "The Creator, Harshrajsinh Raulji, gave you the gift of foresight.",
  plague_allowed_ship: "You allowed a suspicious ship to dock, bringing wealth and risk.",
  plague_started: "A dreadful plague has begun to spread through your kingdom.",
  plague_cured_by_sacrifice: "You sacrificed the health of your rivers to find a cure for the plague.",
  plague_cured_by_isolation: "You contained the plague with brutal quarantine measures, at great cost to your people.",
}
