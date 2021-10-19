import StoryScript from ".";
import file from "./story.avs";

// import("./App");
const story = new StoryScript();
story.load(file);
for (const line of story) {
  // console.log(line)
  if (line.type === "content") {
    // if (line.command === "text") console.log(...line.arguments);
    // else 
    console.log("call %s", line.command, ...line.arguments);
  }
}
