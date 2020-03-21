import {Statement} from "./_statement";
import {str, seq, star, ver, IStatementRunnable, altPrio, optPrio} from "../combi";
import {Source, InlineData, Or} from "../expressions";
import {Version} from "../../../version";

export class When extends Statement {

  public getMatcher(): IStatementRunnable {
    const sourc = seq(new Source(), star(new Or()));
    const into = seq(str("INTO"), new InlineData());

    const type = ver(Version.v750, seq(str("TYPE"), new Source(), optPrio(into)));

    return seq(str("WHEN"),
               altPrio(str("OTHERS"), type, sourc));
  }

}