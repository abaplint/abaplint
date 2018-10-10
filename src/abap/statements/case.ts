import {Statement} from "./statement";
import {str, seq, opt, ver, IRunnable} from "../combi";
import {Version} from "../../version";
import {Source} from "../expressions";

export class Case extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("CASE"),
               opt(ver(Version.v750, str("TYPE OF"))),
               new Source());
  }

}