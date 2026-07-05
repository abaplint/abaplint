import {CDSAs, CDSCondition, CDSFunction, CDSJoin, CDSName, CDSPrefixedName} from ".";
import {altPrio, Expression, opt, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const staticFilter = seq("[", CDSCondition, "]");
    const singleSource = seq(CDSPrefixedName, optPrio(staticFilter), opt(altPrio(CDSAs, CDSName)));
    const funcSingleSource = seq(CDSFunction, opt(altPrio(CDSAs, CDSName)));
    const parenSource = seq("(", altPrio(CDSSource, singleSource), star(CDSJoin), ")");
    return altPrio(parenSource, funcSingleSource, singleSource);
  }
}
