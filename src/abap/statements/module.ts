import {Statement} from "./statement";
import {verNot, str, seq, alt, opt, IRunnable} from "../combi";
import {FormName} from "../expressions";
import {Version} from "../../version";

export class Module extends Statement {

  public get_matcher(): IRunnable {
    let ret = seq(str("MODULE"),
                  new FormName(),
                  opt(alt(str("INPUT"), str("OUTPUT"))));

    return verNot(Version.Cloud, ret);
  }

}