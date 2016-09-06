/*
import {File} from "./file";
import Runner from "./runner";
import Issue from "./issue";

// todo, can this file be removed?

class Linter {
  public static run(filename: string, contents: string): Issue[] {
    let file = new File(filename, contents);
    Runner.run([file]);
    return file.getIssues();
  }
}

namespace Linter {}
export = Linter;
*/