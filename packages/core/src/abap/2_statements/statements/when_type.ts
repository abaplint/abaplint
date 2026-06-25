import {IStatement} from "./_statement";
import {seq, ver, optPrio, AlsoIn} from "../combi";
import {ClassName, Target} from "../expressions";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class WhenType implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seq("INTO", Target);

    const type = seq(ClassName, optPrio(into));

    return ver(Release.v750, seq("WHEN TYPE", type), {also: AlsoIn.OpenABAP});
  }

}