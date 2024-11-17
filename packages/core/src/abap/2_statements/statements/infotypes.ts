import {IStatement} from "./_statement";
import {verNot, seq, optPrio, regex} from "../combi";
import {Constant, FieldSub, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Infotypes implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq("OCCURS", Constant);
    const name = seq("NAME", FieldSub);
    const mode = "MODE N";
    const valid = seq("VALID FROM", Source, "TO", Source);

    const ret = seq("INFOTYPES", regex(/^\d\d\d\d$/), optPrio(valid), optPrio(name), optPrio(occurs), optPrio(mode));

    return verNot(Version.Cloud, ret);
  }

}