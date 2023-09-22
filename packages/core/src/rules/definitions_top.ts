import {Issue} from "../issue";
import {Comment, Unknown} from "../abap/2_statements/statements/_statement";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper, IEdit} from "../edit_helper";
import {StructureNode, StatementNode} from "../abap/nodes";
import {Position} from "../position";

export class DefinitionsTopConf extends BasicRuleConfig {
}

// todo, use enum instead?
// const ANY = 1;
const DEFINITION = 2;
const AFTER = 3;
const IGNORE = 4;

export class DefinitionsTop extends ABAPRule {

  private conf = new DefinitionsTopConf();

  private mode: number;
  private fixed: boolean;
  private moveTo: Position | undefined;

  public getMetadata(): IRuleMetadata {
    return {
      key: "definitions_top",
      title: "Place definitions in top of routine",
      shortDescription: `Checks that definitions are placed at the beginning of METHODs, FORMs and FUNCTIONs.`,
      extendedInformation: `https://docs.abapopenchecks.org/checks/17/`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `FROM foo.
  WRITE 'hello'.
  DATA int TYPE i.
ENDFORM.`,
      goodExample: `FROM foo.
  DATA int TYPE i.
  WRITE 'hello'.
ENDFORM.`,
    };
  }

  private getMessage(): string {
    return "Reorder definitions to top of routine";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DefinitionsTopConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    const containsUnknown = file.getStatements().some(s => s.get() instanceof Unknown);
    if (containsUnknown === true) {
      return [];
    }

    const routines = structure.findAllStructuresMulti([Structures.Form, Structures.Method, Structures.FunctionModule]);
    for (const r of routines) {
      // one fix per routine
      this.fixed = false;

      this.mode = DEFINITION;
      this.moveTo = r.getFirstStatement()?.getLastToken().getEnd();

      const found = this.walk(r, file);
      if (found) {
        issues.push(found);
      }
    }

    return issues;
  }

//////////////////

  private walk(r: StructureNode, file: ABAPFile): Issue | undefined {

    let previous: StatementNode | StructureNode | undefined = undefined;
    for (const c of r.getChildren()) {
      const get = c.get();

      if (c instanceof StatementNode) {
        if (get instanceof Comment) {
          continue;
        } else if (get instanceof Statements.FunctionModule) {
          continue;
        } else if (get instanceof Statements.Form) {
          continue;
        } else if (get instanceof Statements.MethodImplementation) {
          continue;
        }
      }

      if (c instanceof StructureNode
          && (get instanceof Structures.Data
          || get instanceof Structures.Types
          || get instanceof Structures.Constants
          || get instanceof Structures.Statics)) {
        if (this.mode === AFTER) {
          // These are chained structured statements
          let fix = undefined;
          if (c.getLastChild()?.getLastChild()?.getFirstToken().getStr() === "."
              && !(previous instanceof StructureNode)
              && this.moveTo) {
            // this is not perfect, but will work for now
            const start = c.getFirstChild()?.getFirstChild()?.getFirstToken().getStart();
            const end = c.getLastChild()?.getLastChild()?.getLastToken().getEnd();
            if (start && end ) {
              let concat = c.concatTokens();
              concat = concat.replace(/,/g, ".\n");
              const fix1 = EditHelper.deleteRange(file, start, end);
              const fix2 = EditHelper.insertAt(file, this.moveTo, "\n" + concat);
              fix = EditHelper.merge(fix1, fix2);
            }
          }
          // no quick fixes for these, its difficult?
          return Issue.atStatement(file, c.getFirstStatement()!, this.getMessage(), this.getMetadata().key, this.conf.severity, fix);
        } else {
          this.moveTo = c.getLastToken().getEnd();
        }
      } else if (c instanceof StatementNode
          && (get instanceof Statements.Data
          || get instanceof Statements.Type
          || get instanceof Statements.Constant
          || (get instanceof Statements.Move && c.concatTokens().toUpperCase().startsWith("DATA("))
          || get instanceof Statements.Static
          || get instanceof Statements.FieldSymbol)) {
        if (this.mode === AFTER) {
          // only one fix per routine, as it reorders a lot
          if (!(get instanceof Statements.Move && c.concatTokens().toUpperCase().startsWith("DATA("))) {
            let fix = undefined;
            if (this.fixed === false && this.moveTo) {
              fix = this.buildFix(file, c, this.moveTo);
              this.fixed = true;
            }
            return Issue.atStatement(file, c, this.getMessage(), this.getMetadata().key, this.conf.severity, fix);
          }
        } else {
          this.moveTo = c.getLastToken().getEnd();
        }
      } else if (c instanceof StructureNode && get instanceof Structures.Define) {
        this.mode = IGNORE;
        return undefined;
      } else if (c instanceof StatementNode && get instanceof Unknown) {
        this.mode = IGNORE;
        return undefined;
      } else if (c instanceof StatementNode && this.mode === DEFINITION) {
        this.mode = AFTER;
      } else if (c instanceof StructureNode) {
        const found = this.walk(c, file);
        if (found) {
          return found;
        }
      }

      previous = c;
    }

    return undefined;
  }

  private buildFix(file: ABAPFile, statement: StatementNode, at: Position): IEdit {
    let concat = statement.concatTokens();
    concat = concat.replace(/,$/, ".");

    const fix1 = EditHelper.deleteStatement(file, statement);
    const indentation = " ".repeat(statement.getFirstToken().getCol() - 1);
    const fix2 = EditHelper.insertAt(file, at, "\n" + indentation + concat);

    return EditHelper.merge(fix1, fix2);
  }
}