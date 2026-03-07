import {CDSString} from ".";
import {CDSPrefixedName} from "./cds_prefixed_name";
import {altPrio, Expression, regex, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAnnotationSimple extends Expression {
  public getRunnable(): IStatementRunnable {
    const ident = regex(/^[\w_]+$/);
    // #(expr) where expr can be: identifier, dotted path, string, or concatenation with +
    const hashArg = altPrio(CDSString, CDSPrefixedName, ident);
    const hashExpr = seq(hashArg, starPrio(seq("+", hashArg)));

    const value = altPrio(CDSString,
                          "true",
                          "false",
                          "null",
                          seq("-", regex(/^\d+$/), ".", regex(/^\d+$/)),
                          seq("-", regex(/^\d+$/)),
                          seq(regex(/^\d+$/), ".", regex(/^\d+$/)),
                          regex(/^\d+$/),
                          seq("#", "(", hashExpr, ")"),
                          regex(/^#[\w_]+$/));

    return value;
  }
}