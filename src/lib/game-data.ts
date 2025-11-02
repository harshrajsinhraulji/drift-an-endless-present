
export type ResourceId = "environment" | "people" | "army" | "money";
export type StoryFlag = 
  | "studied_star" 
  | "met_astronomer"
  | "creator_github_mercy"
  | "creator_linkedin_prescience"
  | "plague_allowed_ship"
  | "plague_started"
  | "plague_cured_by_sacrifice"
  | "plague_cured_by_isolation"
  | "creator_mercy_acknowledged";

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
  icon: string;
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
  // --- NEW TUTORIAL SEQUENCE ---
  {
    id: 0,
    character: "Ahmose the Dancer",
    icon: "PersonStanding",
    text: "Pharaoh? My Pharaoh? Are you feeling alright? You seem... distant.",
    choices: [
      { text: "What...?", effects: { people: -5 } },
      { text: "Where am I?", effects: { people: -5 } },
    ]
  },
  {
    id: 1,
    character: "The Advisor",
    icon: "Scroll",
    text: "Pharaoh, forgive my intrusion, but your silence worries us. The four pillars of the kingdom... the land, the people, the army, the treasury... they require your guidance.",
    choices: [
        { text: "The... pillars?", effects: {} },
        { text: "My guidance?", effects: {} },
    ]
  },
  {
    id: 2,
    character: "The Advisor",
    icon: "Landmark",
    text: "Every choice you make will strengthen or weaken these pillars. Swipe left or right to issue your decree. The fate of the kingdom rests on your judgment.",
    choices: [
      { text: "I will try to remember.", effects: { people: 5 } },
      { text: "I understand.", effects: { army: 5 } },
    ]
  },
  // --- END TUTORIAL ---
  {
    id: 3,
    character: "The Advisor",
    icon: "Landmark",
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
    id: 4,
    character: "High Priest",
    icon: "Pyramid",
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
    id: 5,
    character: "General",
    icon: "Swords",
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
    id: 6,
    character: "Treasurer",
    icon: "Coins",
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
    id: 7,
    character: "Chief Architect",
    icon: "DraftingCompass",
    text: "Great Pharaoh, we can build a grand monument to your glory. It will be a marvel, but will require immense resources.",
    choices: [
      {
        text: "Build the monument!",
        effects: { people: 20, money: -25, army: -5 },
      },
      {
        text: "Our resources are needed elsewhere.",
        effects: { people: -5 },
      },
    ],
  },
  {
    id: 8,
    character: "Foreign Emissary",
    icon: "Handshake",
    text: "My kingdom offers a trade alliance. It will bring wealth, but also make us dependent on foreign goods.",
    choices: [
      {
        text: "Accept the alliance.",
        effects: { money: 20, army: -10 },
      },
      {
        text: "We will remain self-sufficient.",
        effects: { money: -5 },
      },
    ],
  },
  {
    id: 9,
    character: "Head Farmer",
    icon: "Wheat",
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
    id: 10,
    character: "General",
    icon: "Swords",
    text: [
      {
        text: "Pharaoh, with the coffers overflowing, now is the time to reward our soldiers. A bonus would ensure their loyalty for years to come.",
        highResource: "money"
      },
      {
        text: "My soldiers' morale is low. A pay rise would boost their spirits, but the treasury is already strained.",
        lowResource: "army"
      },
       {
        text: "Pharaoh, my soldiers starve. They cannot fight on glory alone. We must find the funds to pay them, or they will desert.",
        lowResource: "money"
      },
      {
        text: "The army's morale is adequate, Pharaoh. We can maintain their loyalty without additional expense for now.",
      }
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
    id: 11,
    character: "High Priest",
    icon: "Pyramid",
    text: "The people grow restless with our old traditions. A new festival could unite them, or it could be seen as heresy.",
    choices: [
      {
        text: "Announce the new festival.",
        effects: { people: 15, money: -5 },
      },
      {
        text: "Uphold the old ways.",
        effects: { people: -10 },
      },
    ],
  },
  {
    id: 12,
    character: "Lead Astronomer",
    icon: "Sparkles",
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
    id: 13,
    character: "Cult Leader",
    icon: "Torah",
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
    id: 14,
    character: "Chief Alchemist",
    icon: "Beaker",
    text: "Pharaoh, my guild is on the verge of a breakthrough: turning lead into gold! We require a significant investment to complete our Great Work.",
    choices: [
      {
        text: "Fund their research.",
        effects: { money: -20, environment: 10 },
      },
      {
        text: "This is folly. No more funds.",
        effects: { money: 5 },
      },
    ],
  },
  {
    id: 15,
    character: "General",
    icon: "Swords",
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
    id: 16,
    character: "Scribe",
    icon: "Scroll",
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
    id: 17,
    character: "Philosopher",
    icon: "BrainCircuit",
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
    id: 18,
    character: "Merchant Captain",
    icon: "Ship",
    text: "A ship from a distant, plagued land requests to dock. Their cargo is valuable, but they carry risk.",
    choices: [
      {
        text: "Allow them to dock.",
        effects: { money: 20, people: -5 },
        setFlag: "plague_allowed_ship"
      },
      {
        text: "Turn them away.",
        effects: { money: -5 },
      },
    ],
    blockedByFlags: ["plague_started"]
  },
  {
    id: 19,
    character: "Plague Doctor",
    icon: "Pipette",
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
    id: 20,
    character: "Quarantine Guard",
    icon: "ShieldAlert",
    text: "To stop the plague, we must lock the sick in their homes. It is brutal, but it will work.",
    choices: [
      {
        text: "Enforce the quarantine.",
        effects: { people: -20, army: 10 },
        setFlag: "plague_cured_by_isolation"
      },
      {
        text: "Show mercy.",
        effects: { people: 5 },
      },
    ],
    requiredFlags: ["plague_started"],
    blockedByFlags: ["plague_cured_by_sacrifice", "plague_cured_by_isolation"]
  },
  {
    id: 21,
    character: "Royal Spy",
    icon: "EyeOff",
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
  // --- NEW REGULAR CARDS ---
  {
    id: 22,
    character: "Dune Scavenger",
    icon: "Wind",
    text: "I found this strange metal relic in the deep desert. It hums with an inner light. The priests say it's cursed.",
    choices: [
      {
        text: "Bring it to the Alchemists.",
        effects: { money: 15, environment: -5 },
      },
      {
        text: "Heed the priests. Destroy it.",
        effects: { people: 10 },
      },
    ],
  },
  {
    id: 23,
    character: "Master of Canals",
    icon: "Droplets",
    text: "We could divert the Great River through new canals to create more farmland. It is a massive undertaking.",
    choices: [
      {
        text: "Begin the great work.",
        effects: { environment: 20, money: -20, people: 10 },
      },
      {
        text: "The river's path is sacred.",
        effects: { environment: -5 },
      },
    ],
  },
  {
    id: 24,
    character: "Celestial Cartographer",
    icon: "MilkyWay",
    text: "The star charts of the ancients are more advanced than our own. They speak of worlds beyond our sky. Should we fund an observatory to seek them?",
    choices: [
      {
        text: "Scan the heavens.",
        effects: { money: -15, army: 10 },
      },
      {
        text: "Focus on our own world.",
        effects: { people: 5 },
      },
    ],
  },
  {
    id: 25,
    character: "Nomad Chieftain",
    icon: "Users",
    text: "Your expansion encroaches on our ancestral grazing lands. Allow us to live as we always have, or we will be forced to fight for them.",
    choices: [
      {
        text: "Grant them autonomy.",
        effects: { people: 10, army: -5, environment: 5 },
      },
      {
        text: "The land belongs to the kingdom.",
        effects: { army: 10, environment: -10 },
      },
    ],
  },
  {
    id: 26,
    character: "Mine Foreman",
    icon: "Hammer",
    text: "We've struck a vein of a strange, glowing mineral. It's highly unstable but could be a powerful new weapon or energy source.",
    choices: [
      {
        text: "Weaponize it.",
        effects: { army: 25, environment: -15 },
      },
      {
        text: "Study it for energy.",
        effects: { money: 20, environment: -10 },
      },
    ],
  },
  {
    id: 27,
    character: "Keeper of the Archives",
    icon: "Library",
    text: "Ancient scrolls depict a 'Great Silence' that befell our ancestors. They say it was a punishment. Should we publicize this knowledge?",
    choices: [
      {
        text: "The people deserve to know.",
        effects: { people: -15, money: 5 },
      },
      {
        text: "Some history is best forgotten.",
        effects: { people: 10 },
      },
    ],
  },
  {
    id: 50,
    character: "Mysterious Stranger",
    icon: "Wand",
    text: "You seem to be having a difficult time, ruler. Do you enjoy this world I have crafted?",
    isSpecial: true,
    choices: [
      {
        text: "Yes, it is a worthy challenge.",
        effects: { people: 15, environment: 15, army: 15, money: 15 },
      },
      {
        text: "I am struggling.",
        effects: { people: 25 },
      },
    ],
  },
  {
    id: 201,
    character: "Lead Astronomer",
    icon: "Sparkles",
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
    character: "Mysterious Stranger",
    icon: "Github",
    text: "Your reign is... faltering. I am the architect of this endless world. If you wish to continue, you must place your faith in me. Will you accept my help?",
    choices: [
      {
        text: "Yes, I will accept.",
        effects: {},
        setFlag: "creator_github_mercy",
        action: () => window.open('https://github.com/harshrajsinhraulji', '_blank'),
      },
      {
        text: "I will face my fate alone.",
        effects: {},
      },
    ],
    isSpecial: true,
    blockedByFlags: ["creator_github_mercy"]
  },
  {
    id: 303,
    character: "Mysterious Stranger",
    icon: "Linkedin",
    text: "We meet again. Your progress is impressive. As a reward, accept this gift, and I will grant you foresight for a decade.",
    choices: [
      {
        text: "Accept the gift.",
        effects: {},
        setFlag: "creator_linkedin_prescience",
        action: () => window.open('https://www.linkedin.com/in/harshrajsinhraulji/', '_blank'),
      },
      {
        text: "I need no such help.",
        effects: {},
      },
    ],
    isSpecial: true,
    requiredFlags: ["creator_github_mercy"],
    blockedByFlags: ["creator_linkedin_prescience"],
  },
  {
    id: 304,
    character: "Mysterious Stranger",
    icon: "Smile",
    text: "A wise choice. Your reign is restored. A small tip: balance is key. Extremes in any resource will lead to your downfall.",
    choices: [
        {
            text: "I will remember.",
            effects: {},
            setFlag: "creator_mercy_acknowledged",
        },
        {
            text: "Let's continue.",
            effects: {},
            setFlag: "creator_mercy_acknowledged",
        },
    ],
    isSpecial: true,
    requiredFlags: ["creator_github_mercy"],
    blockedByFlags: ["creator_mercy_acknowledged"],
  },
  {
    id: 101,
    character: "Mysterious Stranger",
    icon: "PersonStanding",
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
    icon: "Star",
    text: "A star has fallen from the sky, landing in the desert. It radiates a strange energy. Should we study it or destroy it?",
    choices: [
      {
        text: "Study the star.",
        effects: { environment: 20, people: -10, money: -10, army: 10 },
        setFlag: "studied_star",
      },
      {
        text: "Destroy it.",
        effects: { army: -15 },
      },
    ],
    isSpecial: true,
  },
  {
    id: 104,
    character: "Oracle",
    icon: "BookHeart",
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
    requiredFlags: ["plague_allowed_ship"],
    blockedByFlags: ["plague_started"],
  }
];


export const specialEventCards: CardData[] = []

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
  golden_age: "You have ushered in a Golden Age. Your reign is celebrated for generations, a testament to balance and wisdom. Your kingdom thrives, a beacon in the endless sands of time. You have won.",
};

export const storyFlagDescriptions: Record<StoryFlag, string> = {
  studied_star: "You chose to study the fallen star, unlocking cosmic secrets.",
  met_astronomer: "You have consulted with the royal astronomers.",
  creator_github_mercy: "The Mysterious Stranger, architect of this world, granted you a second chance.",
  creator_linkedin_prescience: "The Mysterious Stranger, architect of this world, gave you the gift of foresight.",
  plague_allowed_ship: "You allowed a suspicious ship to dock, bringing wealth and risk.",
  plague_started: "A dreadful plague has begun to spread through your kingdom.",
  plague_cured_by_sacrifice: "You sacrificed the health of your rivers to find a cure for the plague.",
  plague_cured_by_isolation: "You contained the plague with brutal quarantine measures, at great cost to your people.",
  creator_mercy_acknowledged: "You have acknowledged the Stranger's intervention."
}
