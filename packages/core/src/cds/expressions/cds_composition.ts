import {CDSRelation} from ".";
import {altPrio, Expression, seq, opt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSCardinality} from "./cds_cardinality";

export class CDSComposition extends Expression {
  public getRunnable(): IStatementRunnable {
    const num = altPrio("ONE", "MANY");
    // Text cardinality after OF: "of exact one to many", "of one to many", or bare "of many" / "of one"
    const textCardinality = altPrio(seq(opt("EXACT"), num, "TO", num), seq(opt("EXACT"), num));
    // Only numeric cardinality [0..*] may appear before OF; text cardinality goes after OF.
    const numericCardinality = seq("[", altPrio("0", "1", "*"), opt(seq(".", ".", altPrio("0", "1", "*"))), "]");
    return seq("COMPOSITION", opt(numericCardinality), "OF", opt(altPrio(CDSCardinality, textCardinality)), CDSRelation);
  }
}