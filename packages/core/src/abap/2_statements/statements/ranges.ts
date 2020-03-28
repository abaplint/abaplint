import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Source, SimpleName, FieldSub} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Ranges implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq(str("OCCURS"), new Source());

    const ret = seq(str("RANGES"),
                    new SimpleName(),
                    str("FOR"),
                    new FieldSub(),
                    opt(occurs));

    return verNot(Version.Cloud, ret);
  }

}