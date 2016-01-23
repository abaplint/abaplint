import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Static extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^STATIC(S)? /.test(str)) {
            return new Static(tokens);
        }
        return undefined;
    }

}