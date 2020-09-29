import {IStatement} from "./_statement";
import {str, seq, ver, optPrio} from "../combi";
import {InlineData, ClassName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class WhenType implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seq(str("INTO"), new InlineData());

    const type = seq(new ClassName(), optPrio(into));

    return ver(Version.v750, seq(str("WHEN TYPE"), type));
  }

}