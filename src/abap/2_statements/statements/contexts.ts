import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";

export class Contexts implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("CONTEXTS"),
                    new Field());

    return verNot(Version.Cloud, ret);
  }

}