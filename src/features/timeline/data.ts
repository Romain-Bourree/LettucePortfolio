import type { PanelEntry, TimelineItem } from "./types";

export const TIMELINE_ITEMS: TimelineItem[] = [
  {
    name: "Freelance",
    period: "2007 -> 2013",
    type: "career",
    accent: "#ffffff",
    color: "#121212",
    side: "right",
    gap: 90,
    mt: 36,
    desc: "Early career freelance work alongside my Master degree: branding, small web projects, and first client relationships across France.",
  },
  {
    name: "Faktis",
    period: "2009 – 2011",
    type: "side",
    accent: "#ffffff",
    color: "#121212",
    side: "left",
    gap: 50,
    mt: 18,
    desc: "Co-founded a design collective bringing interaction design to musical events.",
  },
  {
    name: "Graduated",
    period: "2010 · L'École de Design",
    type: "life",
    accent: "#ffffff",
    color: "#121212",
    side: "right",
    gap: 130,
    mt: 22,
    desc: "MDes in Interaction Design and UX. Graduated with jury mention and highest honours.",
  },
  {
    name: "Dsquare",
    period: "2010 – 2011",
    type: "career",
    accent: "#0069FF",
    color: "#001D46",
    side: "left",
    gap: 30,
    mt: 30,
    desc: "Interaction design at Dsquare, a design agency within Niji, working across digital products in Paris before the move to Canada.",
  },
  {
    name: "Invoke",
    period: "2011 – 2013",
    type: "career",
    accent: "#453BE7",
    color: "#120F40",
    side: "right",
    gap: 60,
    mt: 28,
    desc: "Design lead at a startup incubator, helping early-stage companies define strategy, build their brand, and ship their first product.",
  },
  {
    name: "Krushon",
    period: "2012 – 2013",
    type: "side",
    accent: "#FC7350",
    color: "#35170F",
    side: "left",
    gap: 80,
    mt: 14,
    desc: "Designed and shipped a mobile app for missed connections. First solo app from concept to launch.",
  },
  {
    name: "Qudos",
    period: "2014 – 2015",
    type: "career",
    accent: "#3DC9A5",
    color: "#09241D",
    side: "right",
    gap: 110,
    mt: 40,
    desc: "Designed a B2B matchmaking platform making it easier for businesses to find and connect with the right service providers.",
  },
  {
    name: "Mogo",
    period: "May 2016 – June 2020",
    type: "career",
    accent: "#FF002A",
    color: "#2B0007",
    side: "right",
    gap: 75,
    mt: 44,
    desc: "Joined pre-IPO as Senior Designer and grew into Lead over five years, designing products and building the team as Mogo scaled from two products to seven.",
  },
  {
    name: "IBS & Me",
    period: "2017 – 2018",
    type: "side",
    accent: "#F1ACB9",
    color: "#422E32",
    side: "left",
    gap: 65,
    mt: 20,
    desc: "Got diagnosed with IBS, went through the elimination diet with nothing but a spreadsheet. So I designed something better.",
  },
  {
    name: "Bench",
    period: "July 2020 – Jan 2023",
    type: "career",
    accent: "#062D60",
    color: "#020E1F",
    side: "right",
    gap: 140,
    mt: 38,
    desc: "Built the first unified design system at Bench and led the design team through a period of rapid scaling.",
  },
  {
    name: "Fromme Here",
    period: "2022 – 2024",
    type: "side",
    accent: "#FFAD93",
    color: "#2D1E1A",
    side: "left",
    gap: 40,
    mt: 16,
    desc: "Created a local headwear brand for the North Shore mountain biking community, built to give back to the trails I ride.",
  },
  {
    name: "Arrived",
    period: "Feb 2023 – Feb 2025",
    type: "career",
    accent: "#156CD8",
    color: "#052143",
    side: "right",
    gap: 95,
    mt: 32,
    desc: "Led a full rebrand, design system overhaul, and investor portfolio redesign at a real estate fintech platform.",
  },
  {
    name: "H2H",
    period: "Dec 2024 – Now",
    type: "side",
    accent: "#15EA9F",
    color: "#010B08",
    side: "left",
    gap: 70,
    mt: 26,
    desc: "A personal challenge turned real product: learned Cursor, built a fantasy sports iOS app from scratch, and shipped it to the App Store solo.",
  },
  {
    name: "ASSET",
    period: "Feb 2025 – Now",
    type: "career",
    accent: "#2FEC61",
    color: "#00231D",
    side: "right",
    gap: 55,
    mt: 50,
    desc: "First designer in at an AI-driven fintech startup, building everything from brand to product to engineering contributions from scratch.",
  },
];

export const TAG_MAP: Record<TimelineItem["type"], string> = {
  life: "Life",
  career: "Career",
  side: "Side Project",
};

export const PANEL_DATA: Record<string, PanelEntry> = {
  ASSET: {
    subtitle: "Product Designer",
    projectUrl: "https://getasset.com",
    tldr: "Asset is building embedded accounting for platforms, letting SMBs manage their books without leaving the tools they already use. I joined as the first and only designer: no system, no brand, no product design infrastructure. My job was to build all of it while the company was still figuring out what it was.",
    gallery: [
      { src: "/images/Asset/00%20-%20AssetLogo.jpg", alt: "Asset Logo" },
      { src: "/images/Asset/01%20-%20AssetDash.jpg", alt: "Asset Dashboard" },
      { src: "/images/Asset/02%20-%20AssetPads.jpg", alt: "Asset Pads" },
      { src: "/images/Asset/03%20-%20AssetPhone.jpg", alt: "Asset Phones" },
    ],

    shipped: [
      {
        title: "Brand identity",
        body: "Visual language, logo system, and design language built to last across all touchpoints.",
      },
      {
        title: "Design system",
        body: "Component library and foundations built alongside a fast-moving engineering team starting from zero.",
      },
      {
        title: "Marketing site",
        body: "getasset.com, designed and built across design and front-end.",
      },
      {
        title: "Core platform",
        body: "Product experience covering managed bookkeeping, self-serve bookkeeping, financial agents, and platform intelligence.",
      },
      {
        title: "Financial Agents",
        body: "Product surface for AI agents that monitor activity, surface anomalies, and recommend next steps based on real bookkeeping data.",
      },
    ],
    quotes: [
      {
        text: "Turned complex financial workflows into something clean, intuitive, and easy to use. He doesn't just make things look good, he makes sure they actually make sense and feel simple.",
        author: "Alejandro Mesa · CTO & Co-founder",
      },
      {
        text: "A strong sense of taste, moves with intention, and consistently brings a fresh perspective. Beyond his craft, he makes the people around him better.",
        author: "Arthur Davis · Chief of Staff, Asset",
      },
    ],
  },
  ARRIVED: {
    subtitle: "Principal Product Designer",
    projectUrl: "https://arrived.com/properties",
    tldr: "Arrived investors were drowning in data with no context for what it meant or what to do next. My role was to fix that: make the portfolio experience feel like guidance, not just a dashboard. That meant a new design system, a rebrand, and a ground-up redesign of the core investor experience across web and iOS.",
    gallery: [
      {
        src: "/images/Arrived/00%20-%20ArrivedHouse.jpg",
        alt: "Arrived Portfolio",
      },
      {
        src: "/images/Arrived/01%20-%20ArrivedStyle.jpg",
        alt: "Arrived Design Style",
      },
      {
        src: "/images/Arrived/02%20-%20Arrived3Screen.jpg",
        alt: "Arrived Account",
      },
      {
        src: "/images/Arrived/03%20-%20ArrivedPeeps.jpg",
        alt: "Arrived Blog Header",
      },
      {
        src: "/images/Arrived/04%20-%20Arrived2Screen.jpg",
        alt: "Arrived Transaction",
      },
    ],
    shipped: [
      {
        title: "Full rebrand and design system",
        body: "Across the entire product suite, establishing a visual and interaction language that scaled.",
      },
      {
        title: "Investor portfolio redesign",
        body: "Map view, asset allocation, dividend clarity, and performance context all rebuilt from the ground up.",
      },
      {
        title: "Comparison tools",
        body: "Benchmark data so investors could understand their returns relative to the market, not just see numbers.",
      },
      {
        title: "Navigation restructure",
        body: "Two distinct experiences for two distinct users: guidance for newcomers, speed for experienced investors.",
      },
      {
        title: "Customer journey framework",
        body: "Aligned product, design, and engineering on where to invest effort across the full user lifecycle.",
      },
    ],
    quotes: [
      {
        text: "Spearheaded a cross-platform design system that has scaled beautifully over the years.",
        author: "Alex Melagrano · Engineering, Arrived",
      },
      {
        text: "Leaving an impact that will be felt for years to come. His fingerprints are on so many aspects of Arrived's design and success.",
        author: "Reizel Franz · Product Designer, Arrived",
      },
    ],
  },
  BENCH: {
    subtitle: "Principal Product Designer",
    tldr: "Bench helps small business owners stay on top of their books. The problem was that customers were spending more time feeding Bench data than getting value back. That friction was driving churn. My job was to fix the experience while also building the design infrastructure the team needed to move faster and more consistently.",
    gallery: [
      { src: "/images/Bench/00%20-%20Bench.jpg", alt: "Bench Dasboard" },
      { src: "/images/Bench/01%20-%20Bench.jpg", alt: "Bench 1099" },
    ],
    shipped: [
      {
        title: "First unified design system",
        body: "Atomic foundations and component library built with 4 designers and cross-functional engineering leads.",
      },
      {
        title: "1099 in-app experience",
        body: "Customers could find, categorize, and download their 1099 report directly, cutting manual work at year-end.",
      },
      {
        title: "Categorization controls",
        body: "Client-facing rules and auto-categorization that reduced the back-and-forth between customers and their bookkeepers.",
      },
      {
        title: "Journal entry statuses",
        body: "Helped customers understand what needed their attention and why, improving ledger completion rates.",
      },
      {
        title: "Customer journey framework",
        body: "Gave product, design, and engineering a shared map of where to invest across the full customer lifecycle.",
      },
    ],
    quotes: [
      {
        text: "A true design partner who leads by example and always follows through on his word...I will hire him again when the opportunity presents itself. Get him if you can.",
        author:
          "Chris Stone · Head of Design, Fractional (former Director of Design, Bench)",
      },
    ],
  },
  MOGO: {
    subtitle: "Lead Product Designer",
    tldr: "Mogo's mission was to help Canadians get financially fit. I joined before the IPO and spent five years growing with the company: from Senior Designer shipping the web MVP, to Lead Designer running the team and designing products across a platform that scaled from two products to seven. I carried both an IC hat and a leadership hat the whole way through.",
    gallery: [
      {
        src: "/images/Mogo/01%20-%20MogoMoney.jpg",
        alt: "Mogo Money product — additional screen",
      },
      { src: "/images/Mogo/02%20-%20MogoCrypto.jpg", alt: "Mogo Crypto" },
      {
        src: "/images/Mogo/03%20-%20MogoSpend.jpg",
        alt: "Mogo Spend — additional screen",
      },
    ],
    shipped: [
      {
        title: "MogoCrypto",
        body: "One of Canada's first bitcoin buying and selling experiences, designed for simplicity when crypto felt inaccessible to most people.",
      },
      {
        title: "MogoSpend",
        body: "A cashback card with spending controls built for millennials trying to get out of credit card debt.",
      },
      {
        title: "MoneyUp",
        body: "A platform-wide redesign that unified seven Mogo products under a single financial health mission.",
      },
      {
        title: "Mogo Design System",
        body: "Atomic component library built with 4 designers and 3 lead devs, eliminating inconsistencies across the full product suite.",
      },
    ],
    quotes: [
      {
        text: "He brought design from being a simple coat of paint to an integral part of Mogo.",
        author: "Mitchell Galavan · Sr. Lead UXD, Google (former Mogo)",
      },
      {
        text: "Design stopped working FOR them to work WITH them...I am basically what I am today as a designer because of him.",
        author: "Roberta Takaki · Sr. Product Designer, Shopify (former Mogo)",
      },
    ],
  },
  "IBS & ME": {
    subtitle: "Founder & Sole Designer",
    tldr: "Getting diagnosed with IBS means starting a low-FODMAP elimination diet: a 6-12 week process of cutting hundreds of foods, reintroducing them one at a time every 3 days, and tracking symptoms to identify personal triggers. The only tools available were spreadsheets and printed food lists. I went through it myself with nothing but a spreadsheet. So I designed something better.",
    shipped: [],
    quotes: [],
  },
  QUDOS: {
    tldr: "Senior UX/UI Designer in the Vancouver startup ecosystem.",
    quotes: [],
  },
  INVOKE: {
    tldr: "Worked for Invoke Labs, an incubator focused on helping startups define design strategies, grow their vision and brand, and ship strong MVPs across multiple products and services.",
    quotes: [],
  },
  DSQUARE: {
    tldr: "Interaction Designer in Paris -- sharpening the craft in a studio environment before making the move to Canada.",
    quotes: [],
  },
  FREELANCE: {
    tldr: "Six years of freelance product design across France. The foundation of working independently and owning every decision.",
    quotes: [],
  },
  "FROMME HERE": {
    subtitle: "Founder",
    projectUrl: "https://www.instagram.com/fromme_here/",
    tldr: "During Covid I was spending most of my time on the trails of the North Shore. I wanted to create something local: a brand riders could identify with and that gave back to the community maintaining those trails. So I built a headwear brand. Short ride, but a fun one.",
    gallery: [
      { src: "/images/FrommeHere/00%20-%20Fh.jpg", alt: "Fromme Here Brand" },
      { src: "/images/FrommeHere/01%20-%20Fh.jpg", alt: "Fromme Here Poster" },
    ],
    shipped: [
      {
        title: "Brand identity",
        body: "Name, visual language, and creative direction built around the North Shore riding community.",
      },
      {
        title: "Product line",
        body: "Headwear designed for riders, sold locally.",
      },
      {
        title: "Retail experience",
        body: "First time navigating production, inventory, and physical distribution. Learned more about retail in one year than expected.",
      },
    ],
    quotes: [],
  },
  H2H: {
    subtitle: "Founder & Sole builder",
    projectUrl: "https://h2happ.com/",
    tldr: "I love sports and fantasy leagues but I'm a busy dad and season-long commitments never stick. So in 2024 I set myself a challenge: learn Cursor, build an app from scratch, ship it to the App Store. H2H was the result: a one-night fantasy sports game built for people who want to play when they have time, not manage a roster all season.",
    gallery: [
      { src: "/images/H2H/00%20-%20H2HLogo.jpg", alt: "Head-2-Head logo" },
      {
        src: "/images/H2H/01%20-%20H2HWebsite.jpg",
        alt: "Head-2-Head marketing website",
      },
      { src: "/images/H2H/02%20-%20H2HApp.jpg", alt: "Head-2-Head iOS app" },
    ],
    shipped: [
      {
        title: "Full iOS app",
        body: "Private head-to-head challenges across NHL, NFL, MLB, and NBA with real-time scoring.",
      },
      {
        title: "One-night format",
        body: "Draft six players from that day's games, lock your roster, see who wins by morning.",
      },
      {
        title: "Subscription model",
        body: "Unlimited challenges for members, opponents join free.",
      },
      {
        title: "Ad-free experience",
        body: "No dark patterns, no bloat. Just the game.",
      },
      {
        title: "Live on the App Store",
        body: "Concept to shipped, solo, built with Cursor and AI-assisted development.",
      },
    ],
    quotes: [],
  },
};

export const TICK_SOUND = "/sounds/tick.wav";
export const SHEET_TRANSITION_MS = 260;
export const QUOTE_ROTATION_MS = 3200;
export const COMPACT_OVERLAP_SWAP_MS = 2500;
export const LAYOUT_END_BUFFER_YEARS = 3;
export const TIMELINE_CLOSURE_EXTRA_PX = 320;
export const SCROLL_SCRUB_ALPHA = 0.07;
export const SCROLL_SCRUB_ALPHA_MOBILE = 0.055;
export const PX_PER_YEAR = 155;
export const PX_PER_YEAR_MOBILE = 190;
export const VIEWPORT_TRIGGER_RATIO = 0.42;
export const SAME_YEAR_STACK_OFFSET_PX = 16;
export const ACTIVATION_ORDER = [
  "Freelance",
  "Faktis",
  "Dsquare",
  "Graduated",
  "Invoke",
  "Krushon",
  "Qudos",
  "Mogo",
  "IBS & Me",
  "Bench",
  "Fromme Here",
  "Arrived",
  "H2H",
  "ASSET",
] as const;

export const LINKED_HIGHLIGHT_GROUPS: ReadonlyArray<ReadonlyArray<string>> = [
  ["Graduated", "Dsquare"],
];
