import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Concatenate extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^CONCATENATE /.test(str)) {
            return new Concatenate(tokens);
        }
        return undefined;
    }

}