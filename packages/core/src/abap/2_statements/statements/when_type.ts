import {IStatement} from "./_statement";
import {seqs, vers, optPrios} from "../combi";
import {InlineData, ClassName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class WhenType implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seqs("INTO", InlineData);

    const type = seqs(ClassName, optPrios(into));

    return vers(Version.v750, seqs("WHEN TYPE", type));
  }

}