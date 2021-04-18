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
  private moveTo: StatementNode | undefined;

  public getMetadata(): IRuleMetadata {
    return {
      key: "definitions_top",
      title: "Place definitions in top of routine",
      shortDescription: `Checks that definitions are placed at the beginning of METHODs and FORMs.`,
      extendedInformation: `https://docs.abapopenchecks.org/checks/17/`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
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

    // one fix per file
    this.fixed = false;

    const routines = structure.findAllStructures(Structures.Form).concat(structure.findAllStructures(Structures.Method));
    for (const r of routines) {
      this.mode = DEFINITION;
      this.moveTo = r.getFirstStatement();

      const found = this.walk(r, file);
      if (found) {
        issues.push(found);
      }
    }

    return issues;
  }

//////////////////

  private walk(r: StructureNode, file: ABAPFile): Issue | undefined {

    for (const c of r.getChildren()) {
      if (c instanceof StatementNode && c.get() instanceof Comment) {
        continue;
      } else if (c instanceof StatementNode && c.get() instanceof Statements.Form) {
        continue;
      } else if (c instanceof StatementNode && c.get() instanceof Statements.MethodImplementation) {
        continue;
      }

      if (c instanceof StructureNode
          && (c.get() instanceof Structures.Data
          || c.get() instanceof Structures.Types
          || c.get() instanceof Structures.Constants
          || c.get() instanceof Structures.Statics)) {
        if (this.mode === AFTER) {
          // no quick fixes for these, its difficult?
          return Issue.atStatement(file, c.getFirstStatement()!, this.getMessage(), this.getMetadata().key, this.conf.severity);
        }
      } else if (c instanceof StatementNode
          && (c.get() instanceof Statements.Data
          || c.get() instanceof Statements.Type
          || c.get() instanceof Statements.Constant
          || c.get() instanceof Statements.Static
          || c.get() instanceof Statements.FieldSymbol)) {
        if (this.mode === AFTER) {
          // only one fix per file, as it reorders a lot
          let fix = undefined;
          if (this.fixed === false && this.moveTo) {
            fix = this.buildFix(file, c, this.moveTo);
            this.fixed = true;
          }
          return Issue.atStatement(file, c, this.getMessage(), this.getMetadata().key, this.conf.severity, fix);
        } else {
          this.moveTo = c;
        }
      } else if (c instanceof StructureNode && c.get() instanceof Structures.Define) {
        this.mode = IGNORE;
        return undefined;
      } else if (c instanceof StatementNode && c.get() instanceof Unknown) {
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
    }

    return undefined;
  }

  private buildFix(file: ABAPFile, statement: StatementNode, start: StatementNode): IEdit {
    const concat = statement.concatTokens();

    const fix1 = EditHelper.deleteStatement(file, statement);
    const indentation = " ".repeat(statement.getFirstToken().getCol() - 1);
    const fix2 = EditHelper.insertAt(file, start.getEnd(), "\n" + indentation + concat);

    return EditHelper.merge(fix1, fix2);
  }
}