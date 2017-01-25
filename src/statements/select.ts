import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

export class Select extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return new Reuse.Select();
  }

  public isStructure() {
    if (/ SINGLE /.test(this.concatTokens().toUpperCase())
        || / COUNT\(/.test(this.concatTokens().toUpperCase())
        || / TABLE /.test(this.concatTokens().toUpperCase())) {
      return false;
    }

    return true;
  }

  public indentationEnd() {
    return this.isStructure() ? 2 : 0;
  }

}