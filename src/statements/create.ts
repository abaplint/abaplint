import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Create extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^CREATE /.test(str)) {
            return new Create(tokens);
        }
        return undefined;
    }

}