import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {IRegistry} from "../_iregistry";
import {StructureType, TableAccessType, TableType} from "../abap/types/basic";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {ExpressionNode, StatementNode} from "../abap/nodes";
import {ABAPFile} from "../abap/abap_file";
import {ISpaghettiScope} from "../abap/5_syntax/_spaghetti_scope";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {Dash, InstanceArrow, StaticArrow} from "../abap/1_lexer/tokens";
import {Position} from "../position";
import {INode} from "../abap/nodes/_inode";

export class ChangingSortedLineConf extends BasicRuleConfig {
}

export class ChangingSortedLine implements IRule {
  private reg: IRegistry;
  private conf = new ChangingSortedLineConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "changing_sorted_line",
      title: "Line of a sorted or hashed table passed to CHANGING",
      shortDescription: `A field symbol on a whole line of a sorted or hashed table, passed to a CHANGING parameter of a method`,
      extendedInformation: `The key fields of a sorted or hashed table line are write-protected, so the line as a whole is
write-protected. Binding it to a CHANGING parameter activates, but the call fails at runtime with
CX_SY_DYN_CALL_ILLEGAL_TYPE, "the actual parameter for ... is write-protected", even when the method does not
change the key.

Only field symbols assigned in the same method, form or function module are checked, via READ TABLE ... ASSIGNING,
LOOP AT ... ASSIGNING, INSERT ... INTO TABLE ... ASSIGNING and ASSIGN itab[ ... ] TO.

Fix: read the line into a work area, pass the work area and MODIFY TABLE ... FROM it afterwards,
or pass only the non-key fields the method needs.`,
      tags: [RuleTag.SingleFile],
      badExample: `READ TABLE lt_sum WITH TABLE KEY app = lv_app ASSIGNING FIELD-SYMBOL(<sum>).
add( CHANGING cs_sum = <sum> ).`,
      goodExample: `READ TABLE lt_sum WITH TABLE KEY app = lv_app INTO DATA(ls_sum).
add( CHANGING cs_sum = ls_sum ).
MODIFY TABLE lt_sum FROM ls_sum.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public setConfig(conf: ChangingSortedLineConf): void {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject) || obj.getType() === "INTF") {
      return [];
    }

    const issues: Issue[] = [];
    let spaghetti: ISpaghettiScope | undefined = undefined;

    for (const file of obj.getABAPFiles()) {
      const stru = file.getStructure();
      if (stru === undefined || stru.findFirstExpression(Expressions.MethodParameters) === undefined) {
        continue;
      }
      if (spaghetti === undefined) {
        spaghetti = new SyntaxLogic(this.reg, obj).run().spaghetti;
      }

      const blocks = [...stru.findAllStructures(Structures.Method),
        ...stru.findAllStructures(Structures.Form),
        ...stru.findAllStructures(Structures.FunctionModule)];
      for (const block of blocks) {
        // field symbol name -> name of the sorted or hashed table it points into
        const lines = new Map<string, string>();
        for (const statement of block.findAllStatementNodes()) {
          for (const p of statement.findAllExpressions(Expressions.MethodParameters)) {
            this.checkChanging(p, lines, spaghetti, file, issues);
          }
          this.updateAssigned(statement, lines, spaghetti, file);
        }
      }
    }

    return issues;
  }

////////////////

  private checkChanging(params: ExpressionNode, lines: Map<string, string>, spaghetti: ISpaghettiScope, file: ABAPFile, issues: Issue[]) {
    let changing = false;
    for (const child of params.getChildren()) {
      const str = child.concatTokens().toUpperCase();
      if (child instanceof ExpressionNode && changing === true && child.get() instanceof Expressions.ParameterListT) {
        for (const p of child.findDirectExpressions(Expressions.ParameterT)) {
          const target = p.findDirectExpression(Expressions.Target);
          const fs = target?.getChildren().length === 1 ? target.findDirectExpression(Expressions.TargetFieldSymbol) : undefined;
          if (fs === undefined) {
            continue;
          }
          const table = lines.get(fs.concatTokens().toUpperCase());
          const type = this.findReference(fs.getFirstToken().getStart(), spaghetti, file)?.getType();
          if (table === undefined || type === undefined || type.isGeneric()) {
            continue;
          }
          const name = p.findDirectExpression(Expressions.ParameterName)?.concatTokens();
          const message = `Line of sorted or hashed table ${table} passed to CHANGING ${name} is write-protected, ` +
            `the call fails at runtime. Use a work area and MODIFY TABLE ... FROM, or pass only non-key fields`;
          issues.push(Issue.atToken(file, fs.getFirstToken(), message, this.getMetadata().key, this.conf.severity));
        }
      }
      changing = str === "CHANGING";
    }
  }

  /** Tracks which field symbols the last assignment pointed to a whole line of a sorted or hashed table */
  private updateAssigned(statement: StatementNode, lines: Map<string, string>, spaghetti: ISpaghettiScope, file: ABAPFile) {
    const get = statement.get();
    const fs = get instanceof Statements.Unassign
      ? statement.findDirectExpression(Expressions.TargetFieldSymbol)
      : statement.findFirstExpression(Expressions.FSTarget)?.findFirstExpression(Expressions.TargetFieldSymbol);
    if (fs === undefined) {
      return;
    }
    const name = fs.concatTokens().toUpperCase();

    let table: INode | undefined = undefined;
    let isTableExpression = false;
    if (get instanceof Statements.ReadTable) {
      table = statement.findDirectExpression(Expressions.SimpleSource2) ?? statement.findDirectExpression(Expressions.Source);
    } else if (get instanceof Statements.Loop) {
      table = statement.findDirectExpression(Expressions.LoopSource)?.getFirstChild();
    } else if (get instanceof Statements.InsertInternal && statement.findDirectTokenByText("TABLE") !== undefined) {
      table = statement.findDirectExpression(Expressions.Target);
    } else if (get instanceof Statements.Assign) {
      table = statement.findDirectExpression(Expressions.AssignSource)?.getFirstChild();
      isTableExpression = true;
    }

    const tableType = table instanceof ExpressionNode ? this.findTableType(table, isTableExpression, spaghetti, file) : undefined;
    if (table instanceof ExpressionNode && tableType instanceof TableType
        && (tableType.getAccessType() === TableAccessType.sorted || tableType.getAccessType() === TableAccessType.hashed)) {
      lines.set(name, table.concatTokens().replace(/\[.*$/, "").trim());
    } else {
      lines.delete(name);
    }
  }

  /** The type of a table given by a plain field chain of names, components and attributes, else undefined.
   *  With tableExpression, the chain must end with a table expression, and the type of the chain before it is returned */
  private findTableType(node: ExpressionNode, tableExpression: boolean,
                        spaghetti: ISpaghettiScope, file: ABAPFile): AbstractType | undefined {
    if (!(node.get() instanceof Expressions.Target)) {
      const chain = node.getChildren().length === 1 ? node.findDirectExpression(Expressions.FieldChain) : undefined;
      if (chain === undefined) {
        return undefined;
      }
      node = chain;
    }

    const children = [...node.getChildren()];
    if (tableExpression === true) {
      if (!(children.pop()?.get() instanceof Expressions.TableExpression)) {
        return undefined;
      }
    }

    let type: AbstractType | undefined = undefined;
    for (const child of children) {
      const get = child.get();
      if (get instanceof Expressions.SourceField
          || get instanceof Expressions.SourceFieldSymbol
          || get instanceof Expressions.TargetField
          || get instanceof Expressions.TargetFieldSymbol
          || get instanceof Expressions.AttributeName) {
        type = this.findReference(child.getFirstToken().getStart(), spaghetti, file)?.getType();
      } else if (get instanceof Expressions.ComponentName) {
        type = type instanceof StructureType ? type.getComponentByName(child.concatTokens()) : undefined;
      } else if (get instanceof Expressions.ClassName || get instanceof StaticArrow) {
        continue;
      } else if (!(get instanceof Dash) && !(get instanceof InstanceArrow)) {
        return undefined;
      }
      if (type === undefined) {
        return undefined;
      }
    }
    return type;
  }

  private findReference(start: Position, spaghetti: ISpaghettiScope, file: ABAPFile) {
    const scope = spaghetti.lookupPosition(start, file.getFilename());
    for (const r of scope?.getData().references || []) {
      if (r.position.getStart().equals(start) && r.resolved instanceof TypedIdentifier) {
        return r.resolved;
      }
    }
    return undefined;
  }

}
