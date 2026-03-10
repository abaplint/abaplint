import {CDSRelation} from ".";
import {altPrio, Expression, seq, opt, optPrio, regex} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSCardinality} from "./cds_cardinality";

export class CDSComposition extends Expression {
  public getRunnable(): IStatementRunnable {
    const num = altPrio("ONE", "MANY");
    // Text cardinality after OF: "of exact one to many", "of one to many", or bare "of many" / "of one"
    const textCardinality = altPrio(seq(opt("EXACT"), num, "TO", num), seq(opt("EXACT"), num));
    // Numeric cardinality [n..m] before OF: any non-negative integer or *
    const cardNum = altPrio(regex(/^\d+$/), "*");
    const numericCardinality = seq("[", cardNum, optPrio(seq(".", ".", cardNum)), "]");
    return seq("COMPOSITION", optPrio(numericCardinality), "OF", opt(altPrio(CDSCardinality, textCardinality)), CDSRelation);
  }
}