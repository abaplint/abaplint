import { Statement } from "./statement";
import { Token } from "../tokens/";

export class AtSelectionScreen extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^AT SELECTION-SCREEN/.test(str)) {
            return new AtSelectionScreen(tokens);
        }
        return undefined;
    }

}