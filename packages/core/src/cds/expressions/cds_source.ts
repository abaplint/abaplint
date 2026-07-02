import {CDSAs, CDSCondition, CDSFunction, CDSJoin, CDSName, CDSParametersSelect} from ".";
import {altPrio, Expression, opt, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const staticFilter = seq("[", CDSCondition, "]");
    // Dotted path: T._Assoc — association path as FROM source
    const dottedName = seq(CDSName, ".", CDSName);
    const namedSource = altPrio(dottedName, CDSName);
    const singleSource = seq(namedSource, optPrio(CDSParametersSelect), optPrio(staticFilter), opt(altPrio(CDSAs, CDSName)));
    const funcSingleSource = seq(CDSFunction, opt(altPrio(CDSAs, CDSName)));
    const parenSource = seq("(", altPrio(CDSSource, singleSource), star(CDSJoin), ")");
    return altPrio(parenSource, funcSingleSource, singleSource);
  }
}
