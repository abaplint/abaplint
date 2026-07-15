import {CDSSelect} from ".";
import {altPrio, Expression, opt, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSParenSelect extends Expression {
  public getRunnable(): IStatementRunnable {
    const unionBranch = altPrio(CDSParenSelect, CDSSelect);
    const unionOps = star(altPrio(seq("UNION", opt("ALL"), unionBranch), seq("EXCEPT", unionBranch), seq("INTERSECT", unionBranch)));
    return seq("(", altPrio(seq(CDSParenSelect, unionOps), seq(CDSSelect, unionOps)), ")");
  }
}
