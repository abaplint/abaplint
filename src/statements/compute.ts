import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Compute extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^COMPUTE /.test(str)) {
            return new Compute(tokens);
        }
        return undefined;
    }

}