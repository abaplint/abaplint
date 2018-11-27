import {Statement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class ImportDynpro extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("IMPORT DYNPRO"),
                    new Target(),
                    new Target(),
                    new Target(),
                    new Target(),
                    str("ID"),
                    new Source());

    return verNot(Version.Cloud, ret);
  }

}