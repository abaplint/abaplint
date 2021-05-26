import {IStatement} from "./_statement";
import {verNot, seq, optPrio} from "../combi";
import {Constant, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Infotypes implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq("OCCURS", Constant);
    const name = seq("NAME", Field);

    const ret = seq("INFOTYPES", Constant, optPrio(occurs), optPrio(name));

    return verNot(Version.Cloud, ret);
  }

}