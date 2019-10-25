import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {Identifier} from "./_identifier";
import {StructureNode, StatementNode} from "../../abap/nodes";
import {Expression} from "../combi";
import {TypedIdentifier} from "./_typed_identifier";
import {Scope} from "../syntax/_scope";

export class FormDefinition extends Identifier {
  private readonly node: StatementNode;

  constructor(node: StructureNode | StatementNode, filename: string) {
    const st = node instanceof StructureNode ? node.findFirstStatement(Statements.Form)! : node;
    const name = st.findFirstExpression(Expressions.FormName)!.getFirstToken();
    super(name, filename);
    this.node = st;
  }

  public getParameters(): TypedIdentifier[] {
    const res: TypedIdentifier[] = [];
    for (const param of this.node.findAllExpressions(Expressions.FormParam)) {
      const para = param.get() as Expressions.FormParam;
      res.push(para.runSyntax(param, new Scope(), this.filename));
    }
    return res;
  }

  public getTablesParameters(): Identifier[] {
    return this.findType(Expressions.FormTables);
  }

  public getUsingParameters(): Identifier[] {
    return this.findType(Expressions.FormUsing);
  }

  public getChangingParameters(): Identifier[] {
    return this.findType(Expressions.FormChanging);
  }

  private findType(type: new () => Expression): Identifier[] {
    const res: Identifier[] = [];
    const found = this.node.findFirstExpression(type);
    if (found === undefined) {
      return [];
    }

    for (const param of found.findAllExpressions(Expressions.FormParam)) {
      const token = param.getFirstToken();
      res.push(new Identifier(token, this.filename));
    }
    return res;
  }

}