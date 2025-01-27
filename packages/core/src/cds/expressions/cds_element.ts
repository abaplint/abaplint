import {CDSAggregate, CDSAnnotation, CDSArithmetics, CDSCase, CDSFunction, CDSInteger, CDSName, CDSPrefixedName, CDSString} from ".";
import {altPrio, Expression, opt, optPrio, seq, alt, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAs} from "./cds_as";
import {CDSCast} from "./cds_cast";

export class CDSElement extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(starPrio(CDSAnnotation),
               optPrio("KEY"),
               altPrio(CDSAggregate,
                       CDSString,
                       CDSArithmetics,
                       CDSFunction,
                       CDSCast,
                       CDSCase,
                       seq("(", CDSCase, ")"),
                       seq(CDSName, ": REDIRECTED TO", opt(alt("PARENT", "COMPOSITION CHILD")), CDSName),
                       CDSPrefixedName,
                       CDSInteger),
               opt(CDSAs));
  }
}