import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable, opt} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../version";

export class Extract extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("EXTRACT"), opt(new Field()));

    return verNot(Version.Cloud, ret);
  }

}