import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Public extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^PUBLIC SECTION/.test(str)) {
            return new Public(tokens);
        }
        return undefined;
    }

}