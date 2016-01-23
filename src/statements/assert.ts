import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Assert extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ASSERT /.test(str)) {
            return new Assert(tokens);
        }
        return undefined;
    }

}