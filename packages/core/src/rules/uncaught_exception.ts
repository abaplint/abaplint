import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import * as Structures from "../abap/3_structures/structures";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {StatementNode, StructureNode} from "../abap/nodes";
import {IRegistry} from "../_iregistry";
import {Class} from "../objects";
import {DDIC} from "../ddic";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {ISyntaxResult} from "../abap/5_syntax/_spaghetti_scope";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {MethodDefinition} from "../abap/types";

// todo: ignore dynamic and no_check exceptions

export class UncaughtExceptionConf extends BasicRuleConfig {
}

export class UncaughtException extends ABAPRule {

  private conf = new UncaughtExceptionConf();

  private readonly globalExceptions: {name: string, super: string | undefined}[] = [];
  private issues: Issue[] = [];
  private sinked: string[] | undefined;
  private syntax: ISyntaxResult;

  public getMetadata(): IRuleMetadata {
    return {
      key: "uncaught_exception",
      title: "Uncaught Exception",
      shortDescription: `Uncaught Exception

      Does not report any issues if the code contains syntax errors`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    super.initialize(reg);
    this.findGlobalExceptions();
    return this;
  }

  public setConfig(conf: UncaughtExceptionConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    this.syntax = new SyntaxLogic(this.reg, obj).run();
    if (this.syntax.issues.length > 0) {
      return [];
    }

    this.issues = [];
    this.sinked = undefined;
    for (const c of stru.getChildren()) {
      this.traverse(c, file);
    }

    return this.issues;
  }

  private traverse(n: StructureNode | StatementNode, file: ABAPFile) {
    if (n.get() instanceof Structures.ClassDefinition
        || n.get() instanceof Structures.Interface) {
      return; // to optimize performance
    } else if (n.get() instanceof Structures.Try) {
// todo todo todo
    } else if (n instanceof StatementNode && n.get() instanceof Statements.Method) {
      this.setSinkedFromMethod(n, file);
    } else if (n instanceof StatementNode && n.get() instanceof Statements.EndMethod) {
      this.sinked = undefined; // back to top level
    } else if (n instanceof StatementNode && n.get() instanceof Statements.Form) {
      this.sinked = [];
      const raising = n.findDirectExpression(Expressions.FormRaising);
      for (const c of raising?.findAllExpressions(Expressions.ClassName) || []) {
        this.sinked.push(c.concatTokens().toUpperCase());
      }
    } else if (n instanceof StatementNode && n.get() instanceof Statements.EndForm) {
      this.sinked = undefined; // back to top level
    } else if (n instanceof StatementNode && n.get() instanceof Statements.Raise) {
      let name: string | undefined = undefined;

      const concat = n.concatTokens().toUpperCase();
      if (concat.startsWith("RAISE EXCEPTION TYPE ")) {
        name = n.findFirstExpression(Expressions.ClassName)?.getFirstToken().getStr().toUpperCase();
      }

      if (this.isSinked(name) === false) {
        const issue = Issue.atStatement(file, n, "Uncaught exception", this.getMetadata().key, );
        this.issues.push(issue);
      }
    } else if (n instanceof StatementNode && n.get() instanceof Statements.Perform) {
      // todo, PERFORM, or is this not statically checked?
    } else if (n instanceof StatementNode) {
      // todo, search for method call references
    }

    if (n instanceof StructureNode) {
      for (const c of n.getChildren()) {
        this.traverse(c, file);
      }
    }
  }

////////////////////////////////

  private setSinkedFromMethod(s: StatementNode, file: ABAPFile) {
    this.sinked = [];

    const scope = this.syntax.spaghetti.lookupPosition(s.getLastToken().getEnd(), file.getFilename());

    let def: MethodDefinition | undefined = undefined;
    for (const r of scope?.getData().references || []) {
      // there should be only one, so the first is okay
      if (r.referenceType === ReferenceType.MethodImplementationReference
          && r.resolved instanceof MethodDefinition) {
        def = r.resolved;
        break;
      }
    }
    if (def === undefined) {
      return; // this should not occur, so just report everything as errors
    }

    def.getRaising().forEach(r => this.sinked?.push(r));
  }

  private isSinked(name: string | undefined): boolean {
    if (this.sinked === undefined || name === undefined) {
      return true;
    }

    // todo, check hierarchy, both this.globalExceptions and local classes
    return this.sinked.some(a => a.toUpperCase() === name.toUpperCase());
  }

  private findGlobalExceptions() {
    const ddic = new DDIC(this.reg);
    for (const o of this.reg.getObjects()) {
      if (!(o instanceof Class)) {
        continue;
      }
      const def = o.getMainABAPFile()?.getInfo().getClassDefinitionByName(o.getName());
      if (def === undefined || ddic.isException(def, o) === false) {
        continue;
      }

      this.globalExceptions.push({name: o.getName(), super: def.superClassName});
    }

  }

}