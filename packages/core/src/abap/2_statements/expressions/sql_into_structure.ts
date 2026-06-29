import {seq, Expression, optPrio, ver} from "../combi";
import {SQLTarget, SQLIndicators} from ".";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLIntoStructure extends Expression {
  public getRunnable(): IStatementRunnable {

    const intoSimple = seq(optPrio("CORRESPONDING FIELDS OF"), SQLTarget);
    const indicators = optPrio(ver(Release.v915, SQLIndicators));

    return seq("INTO", intoSimple, indicators);
  }
}