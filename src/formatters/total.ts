import {Issue} from "../issue";
import {IFormatter} from "./_iformatter";

export class Total implements IFormatter {

  public output(issues: Array<Issue>): string {
    return "abaplint: " + issues.length + " issue(s) found\n";
  }

}