import { AsyncLocalStorage } from "node:async_hooks";
const storage = new AsyncLocalStorage();
export const runWithAgentContext = (context, callback) => storage.run(context, callback);
export const getAgentContext = () => storage.getStore();
//# sourceMappingURL=requestContext.js.map