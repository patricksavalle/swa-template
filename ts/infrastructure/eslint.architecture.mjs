export default {
  components: [
    { name: "infrastructure-facade", pattern: "ts/infrastructure/index.ts", mode: "file" },
    { name: "infrastructure-adapters", pattern: "ts/infrastructure/adapters/**" },
    { name: "infrastructure-clients", pattern: "ts/infrastructure/clients/**" },
    { name: "infrastructure-config", pattern: "ts/infrastructure/config/**" },
    { name: "infrastructure-other", pattern: "ts/infrastructure/**" }
  ],
  forbidden: []
};
