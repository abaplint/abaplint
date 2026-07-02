import {seq, optPrio, altPrio, regex as reg, plus, ver, Expression} from "../combi";
import {MethodParamOptional, MethodParamName} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class MethodDefImporting extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = reg(/^!?(\/\w+\/)?\w+$/);

    const anyStructureParam = ver(Release.v916, seq(MethodParamName, "TYPE", "ANY", "STRUCTURE", optPrio("OPTIONAL")));

    return seq("IMPORTING",
               plus(altPrio(anyStructureParam, MethodParamOptional)),
               optPrio(seq("PREFERRED PARAMETER", field)));
  }
}
