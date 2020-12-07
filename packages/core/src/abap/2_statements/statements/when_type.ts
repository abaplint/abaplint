import {IStatement} from "./_statement";
import {seq, ver, optPrio} from "../combi";
import {InlineData, ClassName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class WhenType implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seq("INTO", InlineData);

    const type = seq(ClassName, optPrio(into));

    return ver(Version.v750, seq("WHEN TYPE", type));
  }

}