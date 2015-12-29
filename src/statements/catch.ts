import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Catch extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^CATCH/.test(str)) {
            return new Catch(tokens);
        }
        return undefined;
    }

}