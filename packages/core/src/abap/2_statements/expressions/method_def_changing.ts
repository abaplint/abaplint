import {seq, optPrio, altPrio, plus, ver, Expression} from "../combi";
import {MethodParamOptional, MethodParamName} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class MethodDefChanging extends Expression {
  public getRunnable(): IStatementRunnable {
    const anyStructureParam = ver(Release.v916, seq(MethodParamName, "TYPE", "ANY", "STRUCTURE", optPrio("OPTIONAL")));

    return seq("CHANGING", plus(altPrio(anyStructureParam, MethodParamOptional)));
  }
}
