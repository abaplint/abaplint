import {CDSElement, CDSComposition, CDSGroupBy, CDSSource, CDSWhere, CDSHaving, CDSName, CDSPrefixedName, CDSString} from ".";
import {Expression, seq, str, opt, optPrio, star, altPrio, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAssociation} from "./cds_association";
import {CDSJoin} from "./cds_join";

export class CDSSelect extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = seq(star(seq(CDSElement, ",")), CDSElement);
    const distinct = str("DISTINCT");
    const elementList = seq(CDSElement, star(seq(",", CDSElement)), opt(","));
    const elements = seq(str("{"), altPrio("*", elementList), str("}"));

    const aspectValue = altPrio(CDSString, CDSPrefixedName);
    const aspectBinding = seq(CDSPrefixedName, "=", ">", aspectValue);
    const bindAspect = seq(
      "BIND", "ASPECT", CDSName,
      "(", aspectBinding, starPrio(seq(",", aspectBinding)), ")",
      optPrio(seq("AS", CDSName)),
    );

    const parenSelect = seq("(", CDSSelect, ")");
    const unionBranch = altPrio(parenSelect, CDSSelect);

    return seq("SELECT",
               optPrio(distinct),
               opt(altPrio("*", fields)),
               "FROM",
               CDSSource,
               star(CDSJoin),
               star(altPrio(CDSComposition, CDSAssociation)),
               starPrio(bindAspect),
               opt(elements),
               optPrio(CDSWhere),
               optPrio(CDSGroupBy),
               optPrio(CDSHaving),
               optPrio(altPrio(
                 seq("UNION", optPrio("ALL"), unionBranch),
                 seq("EXCEPT", unionBranch),
                 seq("INTERSECT", unionBranch),
               )));
  }
}
