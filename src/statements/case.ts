import {Statement} from "./statement";
import {str, seq, opt, ver, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {Version} from "../version";

export class Case extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("CASE"),
               opt(ver(Version.v750, str("TYPE OF"))),
               new Reuse.Source());
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}