import {Issue} from "../../../../src/issue";
import {IFormatter} from "./_iformatter";

export class Total implements IFormatter {

  public output(issues: Issue[], fileCount: number): string {
    return "abaplint: " + issues.length + " issue(s) found, " + fileCount + " file(s) analyzed\n";
  }

}