import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Return extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^RETURN/.test(str)) {
            return new Return(tokens);
        }
        return undefined;
    }

}