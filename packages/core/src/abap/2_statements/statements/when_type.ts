import {IStatement} from "./_statement";
import {seqs, ver, optPrio} from "../combi";
import {InlineData, ClassName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class WhenType implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seqs("INTO", InlineData);

    const type = seqs(ClassName, optPrio(into));

    return ver(Version.v750, seqs("WHEN TYPE", type));
  }

}