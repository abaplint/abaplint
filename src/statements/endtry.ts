import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Endtry extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ENDTRY/.test(str)) {
            return new Endtry(tokens);
        }
        return undefined;
    }

}