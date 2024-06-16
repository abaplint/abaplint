import {CDSElement, CDSAs, CDSParametersSelect, CDSComposition, CDSGroupBy, CDSSource, CDSWhere, CDSName} from ".";
import {Expression, seq, str, plus, star, opt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAssociation} from "./cds_association";
import {CDSJoin} from "./cds_join";

export class CDSSelect extends Expression {
  public getRunnable(): IStatementRunnable {
    const distinct = seq(str("DISTINCT"), opt(seq("KEY", CDSName)));

    const elements = seq(str("{"), plus(CDSElement), star(seq(",", CDSElement)), str("}"));

    return seq("SELECT", opt(distinct), "FROM", CDSSource,
               opt(CDSParametersSelect),
               opt(CDSAs),
               star(CDSJoin),
               star(CDSComposition),
               star(CDSAssociation),
               star(CDSComposition),
               opt(elements),
               opt(CDSGroupBy),
               opt(CDSWhere),
               opt(seq("UNION", opt("ALL"), CDSSelect)));
  }
}