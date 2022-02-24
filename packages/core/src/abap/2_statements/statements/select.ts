import {IStatement} from "./_statement";
import {seq, ver, starPrio, optPrio, altPrio} from "../combi";
import {Select as eSelect} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Select implements IStatement {

  public getMatcher(): IStatementRunnable {
    const union = ver(Version.v750, seq("UNION", optPrio(altPrio("DISTINCT", "ALL")), eSelect));
    return seq(eSelect, starPrio(union));
  }

}