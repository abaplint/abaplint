import {
  BDEFAction, BDEFAlias, BDEFAssociation, BDEFDetermination, BDEFDetermineAction, BDEFEvent, BDEFField, BDEFHierarchy,
  BDEFImplementationIn, BDEFKey, BDEFMapping, BDEFName, BDEFOperation, BDEFOptions, BDEFSideEffects, BDEFString, BDEFUse,
} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** behavior of one entity, "define behavior for ZI_Travel alias Travel ... { ... }" */
export class BDEFDefineBehavior extends Expression {
  public getRunnable(): IStatementRunnable {
    const fieldMapping = seq(BDEFName, "=", BDEFName);
    const lockMapping = seq("(", fieldMapping, starPrio(seq(",", fieldMapping)), ")");

    const dependentBy = seq("DEPENDENT", optPrio(seq("BY", BDEFName)));
    const save = seq(altPrio("WITH ADDITIONAL SAVE", "WITH UNMANAGED SAVE"), optPrio("AND CLEANUP"), optPrio("WITH FULL DATA"));

    const option = altPrio(
      BDEFAlias,
      BDEFImplementationIn,
      seq("EXTERNAL", BDEFString),
      seq("PERSISTENT TABLE", BDEFName),
      seq("DRAFT TABLE", BDEFName),
      seq("QUERY", BDEFName),
      seq("LOCK", altPrio(seq("MASTER", optPrio("UNMANAGED")), seq(dependentBy, optPrio(lockMapping)))),
      seq("AUTHORIZATION", altPrio(seq("MASTER", BDEFOptions), dependentBy)),
      seq(optPrio("TOTAL"), "ETAG", altPrio(seq("MASTER", BDEFName), dependentBy, BDEFName)),
      // eg. "( lock, authorization, etag ) dependent by _Travel"
      seq(BDEFOptions, dependentBy),
      seq(altPrio("LATE", "EARLY"), "NUMBERING", optPrio("IN PLACE")),
      save,
      "WITH CONTROL",
      "USE ETAG",
      seq("USING", BDEFName),
      seq("CHANGEDOCUMENTS", altPrio(seq("MASTER", optPrio("UTC"), optPrio(BDEFOptions)), dependentBy)),
      "EXTENSIBLE");

    const item = altPrio(
      BDEFUse,
      BDEFDetermineAction,
      BDEFOperation,
      BDEFAction,
      BDEFDetermination,
      BDEFField,
      BDEFAssociation,
      BDEFMapping,
      BDEFSideEffects,
      BDEFEvent,
      BDEFHierarchy,
      BDEFKey,
      seq("CHANGEDOCUMENTS", BDEFOptions, ";"),
      ";");

    return seq(
      altPrio(seq("DEFINE", optPrio("ROOT"), "BEHAVIOR FOR"), "EXTEND BEHAVIOR FOR"),
      BDEFName,
      starPrio(option),
      "{", starPrio(item), "}",
      optPrio(";"));
  }
}
