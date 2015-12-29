import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Perform extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^PERFORM /.test(str)) {
            return new Perform(tokens);
        }
        return undefined;
    }

}