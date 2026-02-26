import {CDSAs, CDSJoin, CDSName, CDSParametersSelect} from ".";
import {altPrio, Expression, opt, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const singleSource = seq(CDSName, optPrio(CDSParametersSelect), opt(altPrio(CDSAs, CDSName)));
    // FROM ( src [JOIN src ON cond]* ) — parenthesized join chain as primary source
    // The inner source may itself be parenthesized: ( ( T1 join T2 ) join T3 )
    const parenSource = seq("(", altPrio(seq("(", singleSource, star(CDSJoin), ")"), singleSource), star(CDSJoin), ")");
    return altPrio(parenSource, singleSource);
  }
}