import { BuildBuilderSchema } from "./schema";

export default async function runExecutor(options: BuildBuilderSchema) {
  console.log("Executor ran for Build", options);
  return {
    success: true,
  };
}
