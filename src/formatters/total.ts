import {Issue} from "../issue";
import {IFormatter} from "./iformatter";

export class Total implements IFormatter {

  public output(issues: Array<Issue>): string {
    return "abaplint: " + issues.length + " issue(s) found\n";
  }

}