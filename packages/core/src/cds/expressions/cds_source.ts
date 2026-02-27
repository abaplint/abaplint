import {CDSAs, CDSJoin, CDSName, CDSParametersSelect} from ".";
import {altPrio, Expression, opt, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const singleSource = seq(CDSName, optPrio(CDSParametersSelect), opt(altPrio(CDSAs, CDSName)));
    // FROM ( src [JOIN src ON cond]* ) — parenthesized join chain, arbitrarily nested
    // CDSSource is self-referential here to handle: (((T1 join T2) join T3) join T4)
    const parenSource = seq("(", altPrio(CDSSource, singleSource), star(CDSJoin), ")");
    return altPrio(parenSource, singleSource);
  }
}