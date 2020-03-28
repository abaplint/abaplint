import {IStatement} from "./_statement";
import {str, seq, star, ver, altPrio, optPrio} from "../combi";
import {Source, InlineData, Or} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class When implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sourc = seq(new Source(), star(new Or()));
    const into = seq(str("INTO"), new InlineData());

    const type = ver(Version.v750, seq(str("TYPE"), new Source(), optPrio(into)));

    return seq(str("WHEN"),
               altPrio(str("OTHERS"), type, sourc));
  }

}