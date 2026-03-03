import {altPrio, Expression, opt, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "./cds_name";
import {CDSParameters} from "./cds_parameters";
import {CDSParametersSelect} from "./cds_parameters_select";
import {CDSCondition} from "./cds_condition";
import {CDSInteger} from "./cds_integer";
import {CDSString} from "./cds_string";

export class CDSPrefixedName extends Expression {
  public getRunnable(): IStatementRunnable {
    // Path filter variants:
    //   [inner], [left outer], [cross]              — join-type redirect
    //   [1:left outer], [1:inner]                   — cardinality + join-type
    //   [1: condition]                              — cardinality + filter condition
    //   [condition]                                 — filter condition only
    const joinType = altPrio("LEFT OUTER", "INNER", "CROSS");
    const joinRedirect = seq("[", joinType, "]");
    const cardinalityJoin = seq("[", CDSInteger, ":", joinType, "]");
    // [1: left outer where (condition)] — cardinality + join-type + WHERE filter
    const cardinalityJoinWhere = seq("[", CDSInteger, ":", joinType, "WHERE", CDSCondition, "]");
    const pathFilter = altPrio(cardinalityJoinWhere, cardinalityJoin, joinRedirect, seq("[", CDSInteger, ":", CDSCondition, "]"), seq("[", CDSCondition, "]"));
    // Each dotted segment may have its own path filter: A[cond].B[cond].C
    // The final segment may also be a string literal: #enum.'value'
    // A segment may have a parameterized call: _Assoc( P_Key : value ) or _Assoc[filter]
    const segment = seq(".", altPrio(CDSString, CDSName), opt(altPrio(CDSParametersSelect, CDSParameters)), opt(pathFilter));
    return seq(CDSName, opt(altPrio(CDSParameters, CDSParametersSelect)), opt(pathFilter), starPrio(segment));
  }
}