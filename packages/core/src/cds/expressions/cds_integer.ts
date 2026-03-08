import {Expression, altPrio, opt, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSInteger extends Expression {
  public getRunnable(): IStatementRunnable {
    const digits = regex(/^\d+$/);
    // Decimal numbers like 100.00 are lexed as 3 tokens: "100" "." "00"
    const decimal = seq(digits, ".", digits);
    // Scientific notation like 0.0000000000000000E+00 is lexed as:
    // "0" "." "0000000000000000E" "+" "00"  (mantissa ends with E, sign, exponent)
    const mantissa = regex(/^\d+E$/i);
    const sciNotation = seq(digits, ".", mantissa, altPrio("+", "-"), digits);
    return seq(opt("-"), altPrio(sciNotation, decimal, digits));
  }
}