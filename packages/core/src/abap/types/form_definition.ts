import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import * as Tokens from "../1_lexer/tokens";
import {Identifier} from "../4_file_information/_identifier";
import {StructureNode, StatementNode, ExpressionNode} from "../nodes";
import {Expression} from "../2_statements/combi";
import {TypedIdentifier, IdentifierMeta} from "./_typed_identifier";
import {CurrentScope} from "../5_syntax/_current_scope";
import {FormParam} from "../5_syntax/expressions/form_param";
import {IFormDefinition} from "./_form_definition";
import {TableKeyType, TableType, UnknownType, VoidType} from "./basic";

export class FormDefinition extends Identifier implements IFormDefinition {
  private readonly node: StatementNode;
  private readonly tableParameters: TypedIdentifier[];
  private readonly usingParameters: TypedIdentifier[];
  private readonly changingParameters: TypedIdentifier[];

  public constructor(node: StructureNode | StatementNode, filename: string, scope: CurrentScope) {
    const st = node instanceof StructureNode ? node.findFirstStatement(Statements.Form)! : node;

    // FORMs can contain a dash in the name
    const formName = st.findFirstExpression(Expressions.FormName);
    const pos = formName!.getFirstToken().getStart();
    const name = formName!.concatTokens();
    const nameToken = new Tokens.Identifier(pos, name);

    super(nameToken, filename);
    this.node = st;

    this.tableParameters = this.findTables(scope, filename);
    this.usingParameters = this.findType(Expressions.FormUsing, scope);
    this.changingParameters = this.findType(Expressions.FormChanging, scope);
  }

  public getTablesParameters(): TypedIdentifier[] {
    return this.tableParameters;
  }

  public getUsingParameters(): TypedIdentifier[] {
    return this.usingParameters;
  }

  public getChangingParameters(): TypedIdentifier[] {
    return this.changingParameters;
  }

///////////////

  private findTables(scope: CurrentScope, filename: string): TypedIdentifier[] {
    const ret: TypedIdentifier[] = [];

    const tables = this.node.findFirstExpression(Expressions.FormTables);
    if (tables === undefined) {
      return [];
    }

    for (const param of tables.findAllExpressions(Expressions.FormParam)) {
      if (param.getChildren().length === 1) {
        // untyped TABLES parameter
        ret.push(new TypedIdentifier(param.getFirstToken(), filename, new VoidType("FORM:UNTYPED"), [IdentifierMeta.FormParameter]));
      } else {
        const p = new FormParam().runSyntax(param, scope, this.filename);

        let type = p.getType();

        const isStructure = param.findDirectTokenByText("STRUCTURE") !== undefined;
        if (isStructure) {
          type = new TableType(type, {withHeader: true, keyType: TableKeyType.default});
        }

        if (type instanceof TableType) {
          type = new TableType(type.getRowType(), {withHeader: true, keyType: TableKeyType.default});
        } else if (!(type instanceof UnknownType) && !(type instanceof VoidType)) {
          type = new UnknownType("FORM TABLES type must be table type");
        }

        ret.push(new TypedIdentifier(p.getToken(), filename, type, [IdentifierMeta.FormParameter]));
      }
    }

    return ret;
  }

  private findType(type: new () => Expression, scope: CurrentScope): TypedIdentifier[] {
    const found = this.node.findFirstExpression(type);
    if (found === undefined) {
      return [];
    }
    return this.findParams(found, scope);
  }

  private findParams(node: ExpressionNode | StatementNode, scope: CurrentScope) {
    const res: TypedIdentifier[] = [];
    for (const param of node.findAllExpressions(Expressions.FormParam)) {
      const p = new FormParam().runSyntax(param, scope, this.filename);
      res.push(p);
    }
    return res;
  }

}