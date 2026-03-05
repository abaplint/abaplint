import {CDSString} from ".";
import {CDSPrefixedName} from "./cds_prefixed_name";
import {alt, Expression, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAnnotationSimple extends Expression {
  public getRunnable(): IStatementRunnable {

    const value = alt(CDSString,
                      "true",
                      "false",
                      "null",
                      seq("-", regex(/^\d+$/)),
                      regex(/^\d+$/),
                      seq(regex(/^\d+$/), ".", regex(/^\d+$/)),
                      seq("#", "(", CDSString, ")"),
                      // #(_Header.Field) — dotted path inside #(...)
                      seq("#", "(", CDSPrefixedName, ")"),
                      seq("#", "(", regex(/^[\w_]+$/), ")"),
                      regex(/^#[\w_]+$/));

    return value;
  }
}