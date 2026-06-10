export default {
  components: [
    { name: "businesslogic-facade", pattern: "ts/businesslogic/index.ts", mode: "file" },
    { name: "businesslogic-domain", pattern: "ts/businesslogic/domain/**" },
    { name: "businesslogic-services", pattern: "ts/businesslogic/services/**" },
    { name: "businesslogic-contracts", pattern: "ts/businesslogic/contracts/**" },
    { name: "businesslogic-other", pattern: "ts/businesslogic/**" }
  ],
  forbidden: [
    {
      from: "businesslogic-*",
      to: "*",
      except_to: ["businesslogic-*"],
      why: "Business logic must not import outside the businesslogic tier."
    }
  ]
};
