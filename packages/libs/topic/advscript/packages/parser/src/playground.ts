
import StoryScript from ".";
import file from "./story.avs";

// import("./App");
const story = new StoryScript();
story.load(file);
for (const line of story) {
  if (line.params && line.type === "content") {
    if (line.params.raw) console.log(line.params.raw);
    else console.log("call %s", line.command, line.params, line.flags);
  }
}
