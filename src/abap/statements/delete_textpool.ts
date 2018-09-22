import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class DeleteTextpool extends Statement {

  public static get_matcher(): IRunnable {
    let language = seq(str("LANGUAGE"), new Source());
    let state = seq(str("STATE"), new Source());

    let ret = seq(str("DELETE TEXTPOOL"),
                  new Source(),
                  opt(language),
                  opt(state));

    return verNot(Version.Cloud, ret);
  }

}