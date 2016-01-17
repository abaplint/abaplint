import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Start extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^START-OF-SELECTION/.test(str)) {
            return new Start(tokens);
        }
        return undefined;
    }

}