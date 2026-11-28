import {CDSAs, CDSCondition, CDSFunction, CDSJoin, CDSName, CDSParametersSelect, CDSPrefixedName} from ".";
import {alt, altPrio, Expression, opt, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const staticFilter = seq("[", CDSCondition, "]");
    const singleSource = seq(CDSPrefixedName, optPrio(CDSParametersSelect), optPrio(staticFilter), opt(altPrio(CDSAs, CDSName)));
    const funcSingleSource = seq(CDSFunction, opt(altPrio(CDSAs, CDSName)));
    const parenSource = seq("(", altPrio(CDSSource, singleSource), star(CDSJoin), ")");
    // an entity, also with parameters or as a path expression, else a call whose arguments are not parameter passing,
    // eg. "=>" with "interval 1 day": both are tried and the first one parsing the whole definition is taken
    return altPrio(parenSource, alt(singleSource, funcSingleSource));
  }
}
