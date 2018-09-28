import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class InsertTextpool extends Statement {

  public static get_matcher(): IRunnable {
    let state = seq(str("STATE"), new Source());
    let language = seq(str("LANGUAGE"), new Source());

    let ret = seq(str("INSERT TEXTPOOL"),
                  new Source(),
                  str("FROM"),
                  new Source(),
                  opt(language),
                  opt(state));

    return verNot(Version.Cloud, ret);
  }

}