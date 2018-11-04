import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../version";

export class Contexts extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("CONTEXTS"),
                  new Field());

    return verNot(Version.Cloud, ret);
  }

}