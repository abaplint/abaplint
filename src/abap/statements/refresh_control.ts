import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class RefreshControl extends Statement {

  public get_matcher(): IRunnable {
    let ret = seq(str("REFRESH CONTROL"),
                  new Source(),
                  str("FROM SCREEN"),
                  new Source());

    return verNot(Version.Cloud, ret);
  }

}