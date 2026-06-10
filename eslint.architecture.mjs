export default {
  components: [
    { name: "api", pattern: "api/**/*.{js,ts,mjs}" },
    { name: "ts-userinterface", pattern: "ts/userinterface/**/*.{js,ts,mjs}" },
    { name: "ts-businesslogic", pattern: "ts/businesslogic/**/*.{js,ts,mjs}" },
    { name: "ts-infrastructure", pattern: "ts/infrastructure/**/*.{js,ts,mjs}" },
    { name: "ts-other", pattern: "ts/**/*.{js,ts,mjs}" },
    { name: "tests", pattern: "tests/**/*.{js,ts,mjs}" },
    { name: "scripts", pattern: "scripts/**/*.{js,mjs}" }
  ],
  forbidden: [
    {
      from: ["businesslogic-*", "ts-businesslogic"],
      to: ["userinterface-*", "ts-userinterface", "infrastructure-*", "ts-infrastructure", "api"],
      why: "Business logic must stay deterministic and must not import UI, platform, API, or infrastructure implementations."
    },
    {
      from: ["infrastructure-*", "ts-infrastructure"],
      to: ["userinterface-*", "ts-userinterface", "api"],
      why: "Infrastructure adapters must not depend on UI or API entrypoints."
    },
    {
      from: "api",
      to: ["userinterface-*", "ts-userinterface"],
      why: "API endpoints must not depend on browser-facing UI code."
    },
    {
      from: ["api", "ts-*", "businesslogic-*", "infrastructure-*", "userinterface-*"],
      to: "scripts",
      why: "Runtime code must not import build, validation, or release scripts."
    }
  ]
};
