import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Read extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^READ /.test(str)) {
            return new Read(tokens);
        }
        return undefined;
    }

}