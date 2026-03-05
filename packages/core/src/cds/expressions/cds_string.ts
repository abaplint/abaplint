import {altPrio, Expression, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSString extends Expression {
  public getRunnable(): IStatementRunnable {
    // Allow any character except unescaped single quote; '' or \' are escaped single quotes.
    // Standalone backslashes (e.g. 'C:\\temp') are also valid as long as they don't form \'.
    const reg = regex(/^'(?:[^'\\]|''|\\'|\\(?!'))*'$/);
    // Typed literal: abap.char 'X' — previously lexed as abap . char'X' (single token)
    // now correctly lexed as three tokens: abap, ., char, 'value'
    const abap = seq("abap", ".", regex(/^char$/), reg);
    return altPrio(abap, reg);
  }
}