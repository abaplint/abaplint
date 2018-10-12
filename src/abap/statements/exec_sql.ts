import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {SimpleName} from "../expressions";
import {Version} from "../../version";

export class ExecSQL extends Statement {

  public static get_matcher(): IRunnable {
    let performing = seq(str("PERFORMING"), new SimpleName());

    let ret = seq(str("EXEC SQL"), opt(performing));

    return verNot(Version.Cloud, ret);
  }

}