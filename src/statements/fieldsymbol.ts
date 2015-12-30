import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class FieldSymbol extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^FIELD-SYMBOL(S?) /.test(str)) {
            return new FieldSymbol(tokens);
        }
        return undefined;
    }

}