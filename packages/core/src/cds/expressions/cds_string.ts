import {altPrio, Expression, optPrio, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSString extends Expression {
  public getRunnable(): IStatementRunnable {
    // Allow any character except unescaped single quote; escape sequences:
    //   ''  — escaped single quote (doubling)
    //   \'  — escaped single quote (backslash form)
    //   \\  — escaped backslash (e.g. '\\' in ltrim/rtrim calls)
    //   \x  — other backslash sequences not followed by '
    const reg = regex(/^'(?:[^'\\]|''|\\'|\\\\|\\(?!'))*'$/);
    // Typed literal: abap.int4'1', abap.char'X', abap.numc(3)'123', etc.
    // Lexed as tokens: abap, ., typename, 'value'
    const abapTypeName = regex(/^(?:int[1-9]|sstring|char|numc|dats|tims|fltp|decfloat\d+|string|raw|xstring|clnt|lang|unit|cuky|curr|quan|d|t|p|n|c|x|f)$/i);
    const abap = seq("abap", ".", abapTypeName, optPrio(seq("(", regex(/^\d+$/), ")")), reg);
    return altPrio(abap, reg);
  }
}