import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class ImportDynpro extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("IMPORT DYNPRO"),
                  new Target(),
                  new Target(),
                  new Target(),
                  new Target(),
                  str("ID"),
                  new Source());

    return verNot(Version.Cloud, ret);
  }

}