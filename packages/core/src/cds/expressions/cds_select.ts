import {CDSComposition, CDSGroupBy, CDSSource, CDSWhere} from ".";
import {Expression, seq, str, plus, star, opt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAssociation} from "./cds_association";
import {CDSElement} from "./cds_element";
import {CDSJoin} from "./cds_join";

export class CDSSelect extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("SELECT", opt("DISTINCT"), "FROM", CDSSource,
               star(CDSJoin),
               star(CDSComposition),
               star(CDSAssociation),
               star(CDSComposition),
               str("{"),
               plus(CDSElement),
               star(seq(",", CDSElement)),
               str("}"),
               opt(CDSGroupBy),
               opt(CDSWhere),
               opt(seq("UNION ALL", CDSSelect)));
  }
}