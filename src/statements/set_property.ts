import {Statement} from "./statement";
import {verNot, seq, str, IRunnable} from "../combi";
import {Source, Constant} from "../expressions";
import {Version} from "../version";

export class SetProperty extends Statement {

  public static get_matcher(): IRunnable {

    let ret = seq(str("SET PROPERTY OF"),
                  new Source(),
                  new Constant,
                  str("="),
                  new Source());

    return verNot(Version.Cloud, ret);
  }

}