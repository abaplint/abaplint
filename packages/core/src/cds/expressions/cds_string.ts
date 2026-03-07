import {altPrio, Expression, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSString extends Expression {
  public getRunnable(): IStatementRunnable {
    // Allow any character except unescaped single quote; escape sequences:
    //   ''  — escaped single quote (doubling)
    //   \'  — escaped single quote (backslash form)
    //   \\  — escaped backslash (e.g. '\\' in ltrim/rtrim calls)
    //   \x  — other backslash sequences not followed by '
    const reg = regex(/^'(?:[^'\\]|''|\\'|\\\\|\\(?!'))*'$/);
    // Typed literal: abap.char 'X' — previously lexed as abap . char'X' (single token)
    // now correctly lexed as three tokens: abap, ., char, 'value'
    const abap = seq("abap", ".", regex(/^char$/), reg);
    return altPrio(abap, reg);
  }
}