export default {
  components: [
    { name: "userinterface-entry", pattern: "ts/userinterface/main.ts", mode: "file" },
    { name: "userinterface-components", pattern: "ts/userinterface/components/**" },
    { name: "userinterface-screens", pattern: "ts/userinterface/screens/**" },
    { name: "userinterface-routes", pattern: "ts/userinterface/routes/**" },
    { name: "userinterface-other", pattern: "ts/userinterface/**" }
  ],
  forbidden: []
};
