import {CDSAggregate, CDSAnnotation, CDSArithmetics, CDSCase, CDSFunction, CDSName, CDSParameters, CDSString} from ".";
import {alt, Expression, opt, optPrio, regex, seq, star, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAs} from "./cds_as";
import {CDSCast} from "./cds_cast";

export class CDSElement extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(starPrio(CDSAnnotation),
               optPrio("KEY"),
               alt(CDSCast,
                   CDSAggregate,
                   CDSString,
                   CDSFunction,
                   CDSArithmetics,
                   CDSCase,
                   seq(CDSName, opt(CDSParameters), star(seq(".", CDSName, opt(CDSParameters)))),
                   regex(/^\d+$/)),
               opt(CDSAs));
  }
}