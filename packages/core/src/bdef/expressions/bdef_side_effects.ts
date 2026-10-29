import {BDEFFieldPath, BDEFName, BDEFReference} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** eg. "side effects { field Price affects field TotalPrice, messages; }" */
export class BDEFSideEffects extends Expression {
  public getRunnable(): IStatementRunnable {
    const fieldList = seq("(", BDEFName, starPrio(seq(",", BDEFName)), ")");
    // eg. "field *", "field ( A, B )", "field _Item.*" or "field _Root.( A, B )"
    const field = seq("FIELD", altPrio(
      "*",
      fieldList,
      seq(BDEFName, starPrio(seq(".", altPrio("*", fieldList, BDEFName))))));

    const permission = altPrio(
      seq("ACTION", BDEFReference),
      field,
      seq(altPrio("CREATE", "UPDATE", "DELETE"), optPrio(BDEFName)));
    const permissions = seq("PERMISSIONS", "(", permission, starPrio(seq(",", permission)), ")");

    const target = altPrio(
      field,
      seq("ENTITY", BDEFFieldPath),
      "MESSAGES",
      permissions,
      "$SELF");
    const targets = seq(target, starPrio(seq(",", target)));

    const trigger = altPrio(field, seq("ENTITY", BDEFFieldPath), "$SELF");
    const triggers = seq(trigger, starPrio(seq(",", trigger)));

    const source = altPrio(
      field,
      seq("ACTION", BDEFReference),
      seq("DETERMINE ACTION", BDEFReference, "EXECUTED ON", triggers),
      seq("ENTITY", BDEFFieldPath),
      seq("EVENT", BDEFName),
      "$SELF");

    const recommendation = seq("RECOMMENDATION FUNCTION", BDEFName, "EXECUTED ON", triggers, ";");

    const item = altPrio(seq(source, "AFFECTS", targets, ";"), recommendation, ";");

    return seq("SIDE EFFECTS", "{", starPrio(item), "}");
  }
}
