import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {IStatement, MacroCall, MacroContent, MacroRecursion, Unknown} from "../abap/2_statements/statements/_statement";
import {ExpressionNode, StatementNode, StructureNode, TokenNode} from "../abap/nodes";
import {Dash, InstanceArrow, StaticArrow} from "../abap/1_lexer/tokens";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";

export class DynamicWhereEmptyConf extends BasicRuleConfig {
  /** Check SELECT and SELECT loops */
  public select: boolean = true;
  /** Check OPEN CURSOR */
  public openCursor: boolean = true;
  /** Check DELETE FROM dbtab */
  public deleteDatabase: boolean = true;
  /** Check UPDATE dbtab SET */
  public updateDatabase: boolean = true;
  /** Check MODIFY dbtab FROM ( SELECT ... ) */
  public modifyDatabase: boolean = true;
  /** Database tables not checked, eg. customizing tables a full read of which is fine, case insensitive */
  public ignoreTables: string[] = [];
  /** Skip statements with UP TO n ROWS, the read is bounded */
  public skipUpTo: boolean = true;
}

// statements after which the rest of the block is not executed
const LEAVING: (new () => IStatement)[] = [Statements.Return, Statements.Exit, Statements.Continue,
  Statements.Raise, Statements.Leave, Statements.Stop, Statements.Reject];

// accepted in the body of IF lv IS INITIAL
const GUARD_EXITS: (new () => IStatement)[] = [...LEAVING, Statements.Message, Statements.Check];

// statements which can change the variable without it being a target
const ESCAPING: (new () => IStatement)[] = [Statements.Assign, Statements.GetReference,
  Statements.Perform, Statements.CallFunction];

interface IDynamicWhere {
  /** the WHERE operand, a single variable */
  token: AbstractToken;
  name: string;
  table: string | undefined;
  upTo: boolean;
}

export class DynamicWhereEmpty extends ABAPRule {
  private conf = new DynamicWhereEmptyConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "dynamic_where_empty",
      title: "Dynamic WHERE can be empty",
      shortDescription: `Reports a dynamic WHERE (lv) whose variable can reach the statement empty`,
      extendedInformation: `An empty dynamic WHERE is no condition: SELECT and OPEN CURSOR read the whole table,
DELETE FROM, UPDATE and MODIFY FROM ( SELECT ... ) change every row.

Checked are SELECT, OPEN CURSOR, DELETE FROM, UPDATE and MODIFY FROM ( SELECT ... ) whose WHERE is a single
dynamic token (lv), lv being a local variable of the method, form or function module, declared by DATA without
VALUE (or with VALUE IS INITIAL or an empty literal).

The statement is reported when no path through the procedure before the statement definitely gives lv a value,
ie. every assignment to lv sits in a conditional block (IF without ELSE, a branch of an IF or CASE where not all
branches assign, a LOOP, WHILE, DO or SELECT loop body, which can run zero times, a TRY block).

Not reported:

* a WHERE with a static condition besides the dynamic token, eg. WHERE mandt = @sy-mandt AND (lv)
* an unconditional assignment to lv before the statement, other than CLEAR or an empty literal
* a guard on lv: IF lv IS INITIAL with RETURN, EXIT, RAISE etc. before the statement,
  CHECK lv IS NOT INITIAL, ASSERT lv IS NOT INITIAL, or the statement inside IF lv IS NOT INITIAL
* UP TO n ROWS, see option skipUpTo
* lv being a parameter, attribute or call result, or lv passed to PERFORM, CALL FUNCTION, ASSIGN or a reference,
  as the value is not known
* procedures containing macros

Subqueries are not checked.`,
      tags: [RuleTag.SingleFile],
      badExample: `METHOD read.
  DATA lv_where TYPE string.
  IF iv_matnr IS NOT INITIAL.
    lv_where = |MATNR = @IV_MATNR|.
  ENDIF.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt_marc.
ENDMETHOD.`,
      goodExample: `METHOD read.
  DATA lv_where TYPE string.
  IF iv_matnr IS NOT INITIAL.
    lv_where = |MATNR = @IV_MATNR|.
  ENDIF.
  IF lv_where IS INITIAL.
    RETURN.
  ENDIF.
  SELECT * FROM marc WHERE (lv_where) INTO TABLE @rt_marc.
ENDMETHOD.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DynamicWhereEmptyConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    const procedures = structure.findAllStructuresMulti([Structures.Method, Structures.Form, Structures.FunctionModule]);
    for (const procedure of procedures) {
      const statements = procedure.findAllStatementNodes();
      if (statements.some(s => s.get() instanceof MacroCall || s.get() instanceof MacroContent
          || s.get() instanceof MacroRecursion || s.get() instanceof Unknown)) {
        continue;
      }

      for (const statement of statements) {
        const found = this.findDynamicWhere(statement);
        if (found === undefined) {
          continue;
        } else if (found.upTo === true && this.conf.skipUpTo === true) {
          continue;
        } else if (found.table !== undefined
            && (this.conf.ignoreTables || []).some(t => t.toUpperCase() === found.table)) {
          continue;
        }

        if (this.canBeEmpty(procedure, statements, statement, found.name) === false) {
          continue;
        }

        const message = `Dynamic WHERE (${found.token.getStr()}) can be empty here, the statement then works on every row`;
        issues.push(Issue.atToken(file, found.token, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

  /////////////////////////////////

  private findDynamicWhere(statement: StatementNode): IDynamicWhere | undefined {
    const type = statement.get();
    let top: StatementNode | ExpressionNode | undefined = undefined;
    let table: string | undefined = undefined;

    if ((type instanceof Statements.Select || type instanceof Statements.SelectLoop) && this.conf.select === true) {
      top = statement.findDirectExpression(Expressions.Select);
    } else if (type instanceof Statements.OpenCursor && this.conf.openCursor === true) {
      top = statement.findDirectExpression(Expressions.Select);
    } else if (type instanceof Statements.DeleteDatabase && this.conf.deleteDatabase === true) {
      top = statement;
    } else if (type instanceof Statements.UpdateDatabase && this.conf.updateDatabase === true) {
      top = statement;
    } else if (type instanceof Statements.ModifyDatabase && this.conf.modifyDatabase === true) {
      top = statement.findDirectExpression(Expressions.Select);
      table = statement.findDirectExpression(Expressions.DatabaseTable)?.concatTokens().toUpperCase();
    }
    if (top === undefined) {
      return undefined;
    }

    if (table === undefined) {
      const from = top.findDirectExpression(Expressions.SQLFrom);
      table = (from ? from.findFirstExpression(Expressions.DatabaseTable) : top.findDirectExpression(Expressions.DatabaseTable))
        ?.concatTokens().toUpperCase();
    }

    const children = top.getChildren();
    const whereIndex = children.findIndex(c => c instanceof TokenNode && c.getFirstToken().getStr().toUpperCase() === "WHERE");
    let operand = children[whereIndex + 1];
    if (whereIndex < 0 || !(operand instanceof ExpressionNode)) {
      return undefined;
    }

    if (operand.get() instanceof Expressions.SQLCond) {
      const compare = operand.getChildren();
      if (compare.length !== 1 || !(compare[0] instanceof ExpressionNode)
          || !(compare[0].get() instanceof Expressions.SQLCompare)) {
        return undefined;
      }
      const dynamic = compare[0].getChildren();
      if (dynamic.length !== 1 || !(dynamic[0] instanceof ExpressionNode)) {
        return undefined;
      }
      operand = dynamic[0];
    }
    if (!(operand instanceof ExpressionNode) || !(operand.get() instanceof Expressions.Dynamic)) {
      return undefined;
    }

    const chain = operand.findDirectExpression(Expressions.FieldChain);
    if (chain === undefined || chain.getChildren().length !== 1
        || !(chain.getFirstChild()?.get() instanceof Expressions.SourceField)) {
      return undefined;
    }
    const token = chain.getFirstToken();

    const upTo = top.findDirectExpression(Expressions.SQLUpTo) !== undefined;

    return {token, name: token.getStr().toUpperCase(), table, upTo};
  }

  /** true if lv can be empty when the statement is reached */
  private canBeEmpty(procedure: StructureNode, statements: StatementNode[], statement: StatementNode, name: string): boolean {
    const declaration = this.findDeclaration(procedure, name);
    if (declaration === undefined || this.isEmptyDeclaration(declaration) === false) {
      return false;
    }

    for (const s of statements) {
      if (s !== statement && this.escapes(s, name)) {
        return false;
      }
    }

    const path = this.findPath(procedure, statement);
    if (path === undefined) {
      return false;
    }

    let assigned = false;
    for (let i = 0; i < path.length; i++) {
      const container = path[i];
      const child = path[i + 1] ?? statement;
      const type = container.get();

      if (type instanceof Structures.Body) {
        for (const sibling of container.getChildren()) {
          if (sibling === child) {
            break;
          }
          assigned = this.apply(assigned, sibling as StructureNode | StatementNode, name);
        }
      } else if (type instanceof Structures.If) {
        const cond = container.findDirectStatement(Statements.If);
        if (child.get() instanceof Structures.Body && this.isPositive(cond, name)) {
          return false;
        } else if (child.get() instanceof Structures.Else && this.isNegative(cond, name)) {
          return false;
        }
      } else if (type instanceof Structures.ElseIf) {
        if (child.get() instanceof Structures.Body && this.isPositive(container.findDirectStatement(Statements.ElseIf), name)) {
          return false;
        }
      } else if (type instanceof Structures.While) {
        if (child.get() instanceof Structures.Body && this.isPositive(container.findDirectStatement(Statements.While), name)) {
          return false;
        }
      }
    }

    return assigned === false;
  }

  /** the state "lv is definitely set, or the statement is not reached" after the node */
  private apply(assigned: boolean, node: StructureNode | StatementNode, name: string): boolean {
    if (node instanceof StructureNode && node.get() instanceof Structures.Normal) {
      const first = node.getChildren()[0];
      if (first === undefined) {
        return assigned;
      }
      return this.apply(assigned, first as StructureNode | StatementNode, name);
    }

    if (node instanceof StatementNode) {
      const type = node.get();
      if (LEAVING.some(l => type instanceof l)) {
        return true;
      } else if ((type instanceof Statements.Check || type instanceof Statements.Assert) && this.isPositive(node, name)) {
        return true;
      } else if (this.isEmptyWrite(node, name)) {
        return false;
      } else if (this.isWrite(node, name)) {
        return true;
      }
      return assigned;
    }

    const type = node.get();
    if (type instanceof Structures.If) {
      const cond = node.findDirectStatement(Statements.If);
      const body = node.findDirectStructure(Structures.Body);
      if (this.isNegative(cond, name)
          && (this.evalBody(body, name) || GUARD_EXITS.some(g => body?.findFirstStatement(g) !== undefined))) {
        return true;
      }
      const elseNode = node.findDirectStructure(Structures.Else);
      if (elseNode === undefined) {
        return assigned;
      }
      const bodies = [body, ...node.findDirectStructures(Structures.ElseIf).map(e => e.findDirectStructure(Structures.Body)),
        elseNode.findDirectStructure(Structures.Body)];
      return bodies.every(b => this.evalBody(b, name)) ? true : assigned;
    } else if (type instanceof Structures.Case) {
      const whens = node.findDirectStructures(Structures.When);
      if (whens.some(w => w.findDirectStatement(Statements.WhenOthers) !== undefined) === false) {
        return assigned;
      }
      return whens.every(w => this.evalBody(w.findDirectStructure(Structures.Body), name)) ? true : assigned;
    }

    return assigned;
  }

  private evalBody(body: StructureNode | undefined, name: string): boolean {
    if (body === undefined) {
      return false;
    }
    let assigned = false;
    for (const child of body.getChildren()) {
      assigned = this.apply(assigned, child as StructureNode | StatementNode, name);
    }
    return assigned;
  }

  private findPath(node: StructureNode, statement: StatementNode): StructureNode[] | undefined {
    for (const child of node.getChildren()) {
      if (child === statement) {
        return [node];
      } else if (child instanceof StructureNode) {
        const found = this.findPath(child, statement);
        if (found !== undefined) {
          return [node, ...found];
        }
      }
    }
    return undefined;
  }

  /** DATA lv in the procedure, not a component of a DATA BEGIN OF structure */
  private findDeclaration(procedure: StructureNode, name: string): StatementNode | undefined {
    const components = new Set<StatementNode>();
    for (const s of procedure.findAllStructuresRecursive(Structures.Data)) {
      for (const d of s.findAllStatements(Statements.Data)) {
        components.add(d);
      }
    }
    for (const data of procedure.findAllStatements(Statements.Data)) {
      if (components.has(data)) {
        continue;
      }
      const defName = data.findDirectExpression(Expressions.DataDefinition)?.findDirectExpression(Expressions.DefinitionName);
      if (defName?.concatTokens().toUpperCase() === name) {
        return data;
      }
    }
    return undefined;
  }

  private isEmptyDeclaration(data: StatementNode): boolean {
    const value = data.findDirectExpression(Expressions.DataDefinition)?.findDirectExpression(Expressions.Value);
    if (value === undefined) {
      return true;
    }
    const concat = value.concatTokens().toUpperCase().replace(/\s+/g, " ");
    return concat === "VALUE IS INITIAL" || isEmptyLiteral(concat.substring("VALUE ".length));
  }

  private nameTokens(statement: StatementNode, name: string) {
    const tokens = statement.getTokens();
    return tokens.filter((t, i) => t.getStr().toUpperCase() === name
      && !(tokens[i - 1] instanceof Dash || tokens[i - 1] instanceof InstanceArrow || tokens[i - 1] instanceof StaticArrow
        || tokens[i - 1]?.getStr() === "~"));
  }

  /** lv can be changed through a reference, field symbol or a call where it is not a target */
  private escapes(statement: StatementNode, name: string): boolean {
    if (this.nameTokens(statement, name).length === 0) {
      return false;
    }
    const type = statement.get();
    if (ESCAPING.some(e => type instanceof e)) {
      return true;
    }
    for (const source of statement.findAllExpressionsRecursive(Expressions.Source)) {
      if (source.getFirstToken().getStr().toUpperCase() === "REF"
          && source.getTokens().some(t => t.getStr().toUpperCase() === name)) {
        return true;
      }
    }
    return statement.findTokenSequencePosition("REFERENCE", "INTO") !== undefined
      || statement.findFirstExpression(Expressions.FSTarget) !== undefined;
  }

  private isWrite(statement: StatementNode, name: string): boolean {
    for (const target of statement.findAllExpressionsRecursive(Expressions.Target)) {
      if (target.getFirstChild()?.get() instanceof Expressions.TargetField
          && target.getFirstToken().getStr().toUpperCase() === name) {
        return true;
      }
    }
    return false;
  }

  /** CLEAR lv, FREE lv, REFRESH lv, lv = '' and the like */
  private isEmptyWrite(statement: StatementNode, name: string): boolean {
    const type = statement.get();
    const targets = statement.findDirectExpressions(Expressions.Target);
    if (targets.length !== 1 || targets[0].concatTokens().toUpperCase() !== name) {
      return false;
    }
    if (type instanceof Statements.Clear) {
      return statement.findDirectTokenByText("WITH") === undefined;
    } else if (type instanceof Statements.Free || type instanceof Statements.Refresh) {
      return true;
    } else if (type instanceof Statements.Move) {
      const source = statement.findDirectExpression(Expressions.Source);
      const tokens = statement.getTokens();
      if (source === undefined || tokens[1]?.getStr() !== "=") {
        return false;
      }
      const concat = source.concatTokens().toUpperCase().replace(/\s+/g, " ");
      return isEmptyLiteral(concat) || concat === "VALUE #( )";
    }
    return false;
  }

  private condition(statement: StatementNode | undefined): string {
    const cond = statement?.findDirectExpression(Expressions.Cond);
    if (cond === undefined) {
      return "";
    }
    return " " + cond.getTokens().map(t => t.getStr().toUpperCase()).join(" ") + " ";
  }

  /** the condition contains lv IS NOT INITIAL or NOT lv IS INITIAL */
  private isPositive(statement: StatementNode | undefined, name: string): boolean {
    const cond = this.condition(statement);
    return cond.includes(` ${name} IS NOT INITIAL `) || cond.includes(` NOT ${name} IS INITIAL `);
  }

  /** the condition contains lv IS INITIAL, not negated */
  private isNegative(statement: StatementNode | undefined, name: string): boolean {
    const cond = this.condition(statement);
    const search = ` ${name} IS INITIAL `;
    let index = cond.indexOf(search);
    while (index >= 0) {
      if (cond.substring(0, index).endsWith(" NOT") === false) {
        return true;
      }
      index = cond.indexOf(search, index + 1);
    }
    return false;
  }
}

function isEmptyLiteral(text: string): boolean {
  return /^'\s*'$/.test(text) || text === "``" || text === "||";
}
