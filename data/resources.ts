import type { Programme, Resource, ResourceCategory, ResourceKind } from "@/lib/types";

// DEMO content written for the prototype. Titles and summaries are illustrative,
// not real YourDOST library items.
export const resources: Resource[] = [
  {
    id: "r-box-breathing", title: "Four-square breathing", kind: "activity", category: "stress", minutes: 4,
    summary: "A short paced-breathing exercise for when everything feels like too much at once.",
    concerns: ["stress", "anxiety", "work_academic"],
    steps: ["Breathe in gently for a count of four.", "Hold for four.", "Breathe out slowly for four.", "Pause for four, then repeat four times."],
  },
  {
    id: "r-overwhelm-article", title: "When your to-do list feels heavier than your day", kind: "article", category: "stress", minutes: 6,
    summary: "Why overwhelm isn't a personal failing, and three ways to make the next hour lighter.",
    concerns: ["stress", "work_academic"],
  },
  {
    id: "r-stress-video", title: "Understanding your stress response", kind: "video", category: "stress", minutes: 8,
    summary: "An animated explainer on what stress does in the body, and why short breaks help.",
    concerns: ["stress", "anxiety"],
  },
  {
    id: "r-worry-time", title: "Scheduled worry time", kind: "activity", category: "anxiety", minutes: 10,
    summary: "Give worries a 10-minute slot each day so they take up less of the rest of it.",
    concerns: ["anxiety"],
    steps: ["Pick a fixed 10-minute time each day.", "When a worry shows up earlier, jot it down and park it.", "In your slot, read the list and note what's in your control.", "Close the notebook when time is up."],
  },
  {
    id: "r-anxiety-article", title: "Anxious thoughts are not facts", kind: "article", category: "anxiety", minutes: 5,
    summary: "A gentle introduction to noticing anxious thoughts without arguing with them.",
    concerns: ["anxiety", "confidence"],
  },
  {
    id: "r-grounding-video", title: "5-4-3-2-1 grounding", kind: "video", category: "anxiety", minutes: 3,
    summary: "A guided video that uses your senses to bring attention back to the present.",
    concerns: ["anxiety", "stress"],
  },
  {
    id: "r-sleep-wind-down", title: "A 20-minute wind-down routine", kind: "activity", category: "sleep", minutes: 20,
    summary: "A step-by-step evening routine to help your body shift out of work mode.",
    concerns: ["sleep", "stress"],
    steps: ["Dim screens and lights 30 minutes before bed.", "Write tomorrow's top three tasks so they're off your mind.", "Do a slow body scan from toes to forehead.", "If you're awake after 20 minutes, get up and do something calm."],
  },
  {
    id: "r-sleep-article", title: "Why you're tired but wired at night", kind: "article", category: "sleep", minutes: 7,
    summary: "How stress and late screens affect sleep, and small changes that tend to help.",
    concerns: ["sleep"],
  },
  {
    id: "r-sleep-audio", title: "Body-scan for sleep", kind: "video", category: "sleep", minutes: 12,
    summary: "A slow guided body-scan narration to listen to in bed.",
    concerns: ["sleep", "anxiety"],
  },
  {
    id: "r-conversations", title: "Having difficult conversations kindly", kind: "article", category: "relationships", minutes: 6,
    summary: "A simple structure for raising something that's bothering you without it becoming a fight.",
    concerns: ["relationships"],
  },
  {
    id: "r-boundaries-video", title: "Boundaries without guilt", kind: "video", category: "relationships", minutes: 9,
    summary: "What healthy boundaries look like with family, partners and colleagues.",
    concerns: ["relationships", "confidence"],
  },
  {
    id: "r-connection-activity", title: "One small reach-out", kind: "activity", category: "relationships", minutes: 5,
    summary: "Pick one person and send a low-pressure message. Connection often starts small.",
    concerns: ["relationships", "low_mood"],
    steps: ["Think of someone you feel safe with.", "Send a short message: no need to explain everything.", "Notice how you feel afterwards, without judging it."],
  },
  {
    id: "r-workload-article", title: "Talking to your manager about workload", kind: "article", category: "workplace", minutes: 6,
    summary: "How to prepare for a conversation about priorities, with a short script you can adapt.",
    concerns: ["work_academic", "stress"],
  },
  {
    id: "r-micro-breaks", title: "Micro-breaks for long workdays", kind: "activity", category: "workplace", minutes: 3,
    summary: "Three 60-second resets to use between meetings.",
    concerns: ["work_academic", "stress"],
    steps: ["Stand up and roll your shoulders slowly.", "Look at something far away for 20 seconds.", "Take three slow breaths before the next task."],
  },
  {
    id: "r-exam-article", title: "Studying under pressure without burning out", kind: "article", category: "academic", minutes: 7,
    summary: "Why rest is part of revision, and a weekly plan that leaves room to breathe.",
    concerns: ["work_academic", "stress"],
  },
  {
    id: "r-exam-video", title: "Calming pre-exam nerves", kind: "video", category: "academic", minutes: 5,
    summary: "A short guided practice for the night before, or the morning of, an exam.",
    concerns: ["work_academic", "anxiety"],
  },
  {
    id: "r-low-mood-activity", title: "Tiny activity planning", kind: "activity", category: "resilience", minutes: 10,
    summary: "When energy is low, plan one small, doable thing. Action can come before motivation.",
    concerns: ["low_mood"],
    steps: ["List three very small things you used to enjoy.", "Pick the easiest one and choose a time today.", "Afterwards, rate how it felt from 1 to 5. Any number is fine."],
  },
  {
    id: "r-low-mood-article", title: "When everything feels flat", kind: "article", category: "resilience", minutes: 6,
    summary: "What low mood can feel like, what tends to help, and when talking to someone may be useful.",
    concerns: ["low_mood"],
  },
  {
    id: "r-self-compassion", title: "Self-compassion break", kind: "activity", category: "resilience", minutes: 5,
    summary: "A three-step pause for moments when your inner voice gets harsh.",
    concerns: ["confidence", "low_mood", "stress"],
    steps: ["Name it: 'This is a hard moment.'", "Remember: 'Others feel this too.'", "Offer yourself one kind sentence, as you would to a friend."],
  },
  {
    id: "r-confidence-video", title: "Building confidence in small steps", kind: "video", category: "resilience", minutes: 7,
    summary: "Why confidence follows action, and how to design tiny experiments.",
    concerns: ["confidence"],
  },
  {
    id: "a-reflection", title: "Wellbeing self-reflection", kind: "assessment", category: "resilience", minutes: 5,
    summary: "Ten reflective questions to notice patterns in mood, energy and stress. Not a diagnosis.",
    concerns: ["other", "low_mood", "stress", "anxiety", "confidence"],
  },
  {
    id: "a-stress-check", title: "Stress check-in", kind: "assessment", category: "stress", minutes: 4,
    summary: "A short reflection on where stress is showing up for you this week. Not a diagnosis.",
    concerns: ["stress", "work_academic"],
  },
  {
    id: "a-sleep-diary", title: "Sleep patterns reflection", kind: "assessment", category: "sleep", minutes: 3,
    summary: "Five quick prompts to notice what might be getting in the way of rest. Not a diagnosis.",
    concerns: ["sleep"],
  },
];

export const programmes: Programme[] = [
  {
    id: "p-stress-reset", name: "Stress Reset", weeks: 2, minutesPerDay: 10,
    description: "A two-week guided programme to notice stress early and build small daily recovery habits.",
    expect: ["One 10-minute audio a day", "A weekly reflection", "Optional check-in with a counsellor"],
    concerns: ["stress", "work_academic"],
  },
  {
    id: "p-sleep", name: "Sleep Well in 14 Days", weeks: 2, minutesPerDay: 10,
    description: "Evidence-informed sleep habits, a wind-down routine and a sleep diary to track what changes.",
    expect: ["Daily wind-down practice", "Sleep diary prompts", "Tips for screens, caffeine and late work"],
    concerns: ["sleep"],
  },
  {
    id: "p-calm-mind", name: "Calmer Mind", weeks: 3, minutesPerDay: 12,
    description: "A three-week programme on understanding worry and practising grounding skills.",
    expect: ["Short lessons on how worry works", "Daily grounding practice", "A personal 'worry plan'"],
    concerns: ["anxiety"],
  },
  {
    id: "p-gratitude", name: "21 Days of Gratitude", weeks: 3, minutesPerDay: 5,
    description: "A light daily practice of noticing what went okay, often run as an organisation-wide campaign.",
    expect: ["A 5-minute daily prompt", "Weekly reflection", "Optional sharing with your team"],
    concerns: ["low_mood", "confidence", "other"],
  },
  {
    id: "p-connection", name: "Connected", weeks: 2, minutesPerDay: 8,
    description: "Practical skills for communication, boundaries and reconnecting with people who matter.",
    expect: ["Short skill videos", "One small connection task a day", "Conversation planning template"],
    concerns: ["relationships"],
  },
];

export const resourceById = (id: string) => resources.find((r) => r.id === id);
export const programmeById = (id: string) => programmes.find((p) => p.id === id);

export const categoryLabels: Record<ResourceCategory, string> = {
  stress: "Stress management",
  anxiety: "Anxiety",
  sleep: "Sleep",
  relationships: "Relationships",
  workplace: "Workplace wellbeing",
  academic: "Academic pressure",
  resilience: "Emotional resilience",
};

export const kindLabels: Record<ResourceKind, string> = {
  article: "Article",
  video: "Video",
  activity: "Guided activity",
  assessment: "Self-reflection",
  programme: "Programme",
};
