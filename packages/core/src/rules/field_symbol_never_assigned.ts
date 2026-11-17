import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {StatementNode} from "../abap/nodes/statement_node";
import {ExpressionNode} from "../abap/nodes/expression_node";
import {TokenNode} from "../abap/nodes/token_node";
import {ABAPFile} from "../abap/abap_file";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {MacroCall, Unknown} from "../abap/2_statements/statements/_statement";

export class FieldSymbolNeverAssignedConf extends BasicRuleConfig {
}

export class FieldSymbolNeverAssigned extends ABAPRule {
  private conf = new FieldSymbolNeverAssignedConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "field_symbol_never_assigned",
      title: "Field symbol never assigned",
      shortDescription: `Reports a local field symbol that is used, but never assigned in its method, form or function module`,
      extendedInformation: `A field symbol declared with FIELD-SYMBOLS in a method, form or function module can only be
assigned in that procedure. If no ASSIGN ... TO <fs> or ... ASSIGNING <fs> of it exists there,
reading or writing it raises the runtime error GETWA_NOT_ASSIGNED. This is typically a copy-paste
error, where a statement uses a field symbol other than the one assigned before it.

Assignments are ASSIGN, ASSIGN LOCAL COPY, and ASSIGNING of LOOP, READ TABLE, INSERT, APPEND,
MODIFY and COLLECT, anywhere in the procedure. The order of the statements is not checked.

Not reported: field symbols only used in IS [NOT] ASSIGNED or UNASSIGN, field symbols declared
with DEFAULT, inline declarations, global field symbols, and procedures that contain a macro
call, an INCLUDE or a statement that cannot be parsed.`,
      tags: [RuleTag.SingleFile],
      badExample: `FIELD-SYMBOLS <type> TYPE ty_type.
FIELD-SYMBOLS <attr> TYPE ty_attr.
LOOP AT types ASSIGNING <type>.
  CLEAR <attr>-author.
ENDLOOP.`,
      goodExample: `FIELD-SYMBOLS <type> TYPE ty_type.
LOOP AT types ASSIGNING <type>.
  CLEAR <type>-author.
ENDLOOP.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: FieldSymbolNeverAssignedConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const statements = file.getStatements();

    let start: number | undefined = undefined;
    for (let i = 0; i < statements.length; i++) {
      const s = statements[i].get();
      if (s instanceof Statements.MethodImplementation
          || s instanceof Statements.Form
          || s instanceof Statements.FunctionModule) {
        start = i;
      } else if (start !== undefined
          && (s instanceof Statements.EndMethod
          || s instanceof Statements.EndForm
          || s instanceof Statements.EndFunction)) {
        issues.push(...this.checkProcedure(file, statements.slice(start, i + 1)));
        start = undefined;
      }
    }

    return issues;
  }

////////////////

  private checkProcedure(file: ABAPFile, statements: readonly StatementNode[]): Issue[] {
    const declared = new Map<string, string>();
    const assigned = new Set<string>();
    const used = new Map<string, AbstractToken>();

    for (const statement of statements) {
      const s = statement.get();
      if (s instanceof Unknown
          || s instanceof MacroCall
          || s instanceof Statements.Include) {
        return [];
      } else if (s instanceof Statements.FieldSymbol) {
        const name = statement.findDirectExpression(Expressions.FieldSymbol)?.concatTokens();
        if (name !== undefined && statement.findDirectTokenByText("DEFAULT") === undefined) {
          declared.set(name.toUpperCase(), name);
        }
        continue;
      } else if (s instanceof Statements.Unassign) {
        continue;
      }
      this.walk(statement, assigned, used);
    }

    const issues: Issue[] = [];
    const procedure = this.procedureName(statements[0]);
    for (const [upper, name] of declared) {
      const token = used.get(upper);
      if (token === undefined || assigned.has(upper)) {
        continue;
      }
      const message = `Field symbol ${name} is never assigned in this ${procedure}`;
      issues.push(Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity));
    }
    return issues;
  }

  /** collects the assigned field symbols, and the first use of each other field symbol */
  private walk(node: StatementNode | ExpressionNode, assigned: Set<string>, used: Map<string, AbstractToken>): void {
    for (const child of node.getChildren()) {
      if (child instanceof TokenNode) {
        continue;
      }
      const e = child.get();
      if (e instanceof Expressions.FSTarget
          || e instanceof Expressions.InlineFS
          || (e instanceof Expressions.TargetFieldSymbol && this.isBinding(node))) {
        const name = child.findFirstExpression(Expressions.FieldSymbol)?.concatTokens();
        if (name !== undefined) {
          assigned.add(name.toUpperCase());
        }
      } else if (e instanceof Expressions.Compare && child.findDirectTokenByText("ASSIGNED") !== undefined) {
        continue;
      } else if (e instanceof Expressions.FieldSymbol) {
        const upper = child.concatTokens().toUpperCase();
        if (used.has(upper) === false) {
          used.set(upper, child.getFirstToken());
        }
      } else {
        this.walk(child as ExpressionNode, assigned, used);
      }
    }
  }

  /** TargetFieldSymbol directly in these binds the field symbol, elsewhere it is a write to the assigned data */
  private isBinding(parent: StatementNode | ExpressionNode): boolean {
    const p = parent.get();
    return p instanceof Statements.AssignLocalCopy
      || p instanceof Expressions.For
      || p instanceof Expressions.InlineLoopDefinition;
  }

  private procedureName(statement: StatementNode): string {
    const s = statement.get();
    if (s instanceof Statements.Form) {
      return "form";
    } else if (s instanceof Statements.FunctionModule) {
      return "function module";
    }
    return "method";
  }

}
