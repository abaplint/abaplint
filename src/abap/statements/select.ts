import {Statement} from "./statement";
import {IRunnable} from "../combi";
import {Select as eSelect} from "../expressions";

export class Select extends Statement {

  public static get_matcher(): IRunnable {
    return new eSelect();
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