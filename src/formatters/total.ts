import {Issue} from "../issue";

export class Total {

  public static output(issues: Array<Issue>): string {
    return "abaplint: " + issues.length + " issue(s) found\n";
  }

}