import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Endloop extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ENDLOOP/.test(str)) {
            return new Endloop(tokens);
        }
        return undefined;
    }

}