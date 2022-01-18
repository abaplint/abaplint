import * as Statements from "../2_statements/statements";
import * as Structures from "../3_structures/structures";
import {Issue} from "../../issue";
import {Token} from "../1_lexer/tokens/_token";
import {StatementNode, StructureNode} from "../nodes";
import {IRegistry} from "../../_iregistry";
import {ABAPObject} from "../../objects/_abap_object";
import {CurrentScope} from "./_current_scope";
import {ScopeType} from "./_scope_type";
import {ObjectOriented} from "./_object_oriented";
import {Procedural} from "./_procedural";
import {FunctionGroup, Program, TypePool} from "../../objects";
import {Position} from "../../position";
import {Data as DataStructure} from "./structures/data";
import {TypeEnum} from "./structures/type_enum";
import {Types} from "./structures/types";
import {Statics} from "./structures/statics";
import {Constants} from "./structures/constants";
import {ClassDefinition} from "../types/class_definition";
import {InterfaceDefinition} from "../types/interface_definition";
import {ISyntaxResult} from "./_spaghetti_scope";

import {Perform} from "./statements/perform";
import {Type} from "./statements/type";
import {Constant} from "./statements/constant";
import {Static} from "./statements/static";
import {Data as DataStatement} from "./statements/data";
import {Parameter} from "./statements/parameter";
import {FieldSymbol} from "./statements/fieldsymbol";
import {Tables} from "./statements/tables";
import {SelectOption} from "./statements/selectoption";
import {InterfaceDeferred} from "./statements/interface_deferred";
import {ClassDeferred} from "./statements/class_deferred";
import {Call} from "./statements/call";
import {ClassImplementation} from "./statements/class_implementation";
import {MethodImplementation} from "./statements/method_implementation";
import {Move} from "./statements/move";
import {MoveCorresponding} from "./statements/move_corresponding";
import {Catch} from "./statements/catch";
import {Loop} from "./statements/loop";
import {ReadTable} from "./statements/read_table";
import {Select} from "./statements/select";
import {InsertInternal} from "./statements/insert_internal";
import {Split} from "./statements/split";
import {Assign} from "./statements/assign";
import {Convert} from "./statements/convert";
import {Describe} from "./statements/describe";
import {Find} from "./statements/find";
import {Message} from "./statements/message";
import {GetTime} from "./statements/get_time";
import {GetParameter} from "./statements/get_parameter";
import {WhenType} from "./statements/when_type";
import {If} from "./statements/if";
import {ElseIf} from "./statements/else_if";
import {Append} from "./statements/append";
import {SelectionScreen} from "./statements/selection_screen";
import {Ranges} from "./statements/ranges";
import {Write} from "./statements/write";
import {Case} from "./statements/case";
import {CreateObject} from "./statements/create_object";
import {Do} from "./statements/do";
import {Concatenate} from "./statements/concatenate";
import {CallFunction} from "./statements/call_function";
import {Clear} from "./statements/clear";
import {Replace} from "./statements/replace";
import {GetBit} from "./statements/get_bit";
import {Raise} from "./statements/raise";
import {DeleteInternal} from "./statements/delete_internal";
import {Receive} from "./statements/receive";
import {When} from "./statements/when";
import {CreateData} from "./statements/create_data";
import {CallTransformation} from "./statements/call_transformation";
import {GetLocale} from "./statements/get_locale";
import {SetLocale} from "./statements/set_locale";
import {Sort} from "./statements/sort";
import {ReadReport} from "./statements/read_report";
import {AuthorityCheck} from "./statements/authority_check";
import {InsertReport} from "./statements/insert_report";
import {GetReference} from "./statements/get_reference";
import {InsertDatabase} from "./statements/insert_database";
import {DeleteDatabase} from "./statements/delete_database";
import {ImportDynpro} from "./statements/import_dynpro";
import {SyntaxCheck} from "./statements/syntax_check";
import {Import} from "./statements/import";
import {Export} from "./statements/export";
import {Scan} from "./statements/scan";
import {Submit} from "./statements/submit";
import {OpenDataset} from "./statements/open_dataset";
import {CloseDataset} from "./statements/close_dataset";
import {GetRunTime} from "./statements/get_run_time";
import {UpdateDatabase} from "./statements/update_database";
import {Add} from "./statements/add";
import {Subtract} from "./statements/subtract";
import {AddCorresponding} from "./statements/add_corresponding";
import {SubtractCorresponding} from "./statements/subtract_corresponding";
import {Multiply} from "./statements/multiply";
import {Divide} from "./statements/divide";
import {Condense} from "./statements/condense";
import {Controls} from "./statements/controls";
import {While} from "./statements/while";
import {SelectLoop} from "./statements/select_loop";
import {Check} from "./statements/check";
import {LogPoint} from "./statements/log_point";
import {Severity} from "../../severity";
import {RaiseEvent} from "./statements/raise_event";
import {Form} from "./statements/form";
import {ABAPFile} from "../abap_file";
import {Assert} from "./statements/assert";
import {SetParameter} from "./statements/set_parameter";
import {ClassLocalFriends} from "./statements/class_local_friends";
import {GetBadi} from "./statements/get_badi";
import {With} from "./statements/with";
import {WithLoop} from "./statements/with_loop";
import {SystemCall} from "./statements/system_call";
import {Collect} from "./statements/collect";
import {Transfer} from "./statements/transfer";
import {ModifyDatabase} from "./statements/modify_database";
import {TruncateDataset} from "./statements/truncate_dataset";
import {CallBadi} from "./statements/call_badi";
import {Pack} from "./statements/pack";
import {Unpack} from "./statements/unpack";
import {Format} from "./statements/format";
import {SetPFStatus} from "./statements/set_pf_status";
import {SetTitlebar} from "./statements/set_titlebar";
import {StatementSyntax} from "./_statement_syntax";
import {CallTransaction} from "./statements/call_transaction";
import {SetHandler} from "./statements/set_handler";
import {Wait} from "./statements/wait";
import {DeleteReport} from "./statements/delete_report";
import {Shift} from "./statements/shift";
import {SetBit} from "./statements/set_bit";
import {ModifyScreen} from "./statements/modify_screen";
import {DeleteCluster} from "./statements/delete_cluster";
import {Unassign} from "./statements/unassign";
import {InsertTextpool} from "./statements/insert_textpool";
import {GetCursor} from "./statements/get_cursor";

// -----------------------------------

const map: {[name: string]: StatementSyntax} = {};
function addToMap(handler: StatementSyntax) {
  if (map[handler.constructor.name] !== undefined) {
    throw new Error("syntax.ts duplicate statement syntax handler");
  }
  map[handler.constructor.name] = handler;
}
if (Object.keys(map).length === 0) {
  addToMap(new InterfaceDeferred());
  addToMap(new Perform());
  addToMap(new ClassDeferred());
  addToMap(new Call());
  addToMap(new SetHandler());
  addToMap(new ClassImplementation());
  addToMap(new MethodImplementation());
  addToMap(new Move());
  addToMap(new GetBadi());
  addToMap(new CallBadi());
  addToMap(new GetCursor());
  addToMap(new Replace());
  addToMap(new TruncateDataset());
  addToMap(new Assert());
  addToMap(new Catch());
  addToMap(new Loop());
  addToMap(new SetPFStatus());
  addToMap(new SetTitlebar());
  addToMap(new Submit());
  addToMap(new InsertTextpool());
  addToMap(new ReadTable());
  addToMap(new SyntaxCheck());
  addToMap(new DeleteReport());
  addToMap(new Import());
  addToMap(new Collect());
  addToMap(new Export());
  addToMap(new Scan());
  addToMap(new Transfer());
  addToMap(new Split());
  addToMap(new CallFunction());
  addToMap(new DeleteInternal());
  addToMap(new DeleteCluster());
  addToMap(new Clear());
  addToMap(new Receive());
  addToMap(new GetBit());
  addToMap(new ClassLocalFriends());
  addToMap(new Select());
  addToMap(new ModifyScreen());
  addToMap(new InsertInternal());
  addToMap(new Pack());
  addToMap(new Unpack());
  addToMap(new Assign());
  addToMap(new SetLocale());
  addToMap(new SetParameter());
  addToMap(new Convert());
  addToMap(new Controls());
  addToMap(new When());
  addToMap(new InsertDatabase());
  addToMap(new DeleteDatabase());
  addToMap(new UpdateDatabase());
  addToMap(new Sort());
  addToMap(new Wait());
  addToMap(new Condense());
  addToMap(new SetBit());
  addToMap(new OpenDataset());
  addToMap(new CloseDataset());
  addToMap(new ReadReport());
  addToMap(new Do());
  addToMap(new Describe());
  addToMap(new Find());
  addToMap(new Message());
  addToMap(new SystemCall());
  addToMap(new GetTime());
  addToMap(new Unassign());
  addToMap(new GetParameter());
  addToMap(new Format());
  addToMap(new WhenType());
  addToMap(new If());
  addToMap(new LogPoint());
  addToMap(new While());
  addToMap(new With());
  addToMap(new WithLoop());
  addToMap(new CallTransformation());
  addToMap(new CallTransaction());
  addToMap(new GetLocale());
  addToMap(new GetReference());
  addToMap(new ElseIf());
  addToMap(new GetRunTime());
  addToMap(new CreateObject());
  addToMap(new ImportDynpro());
  addToMap(new CreateData());
  addToMap(new Case());
  addToMap(new Shift());
  addToMap(new Raise());
  addToMap(new Concatenate());
  addToMap(new Append());
  addToMap(new SelectLoop());
  addToMap(new Write());
  addToMap(new MoveCorresponding());
  addToMap(new AuthorityCheck());
  addToMap(new InsertReport());
  addToMap(new SelectionScreen());
  addToMap(new Ranges());
  addToMap(new Add());
  addToMap(new RaiseEvent());
  addToMap(new Subtract());
  addToMap(new AddCorresponding());
  addToMap(new SubtractCorresponding());
  addToMap(new Multiply());
  addToMap(new Divide());
  addToMap(new Check());
  addToMap(new ModifyDatabase());
  addToMap(new Form());
  addToMap(new SelectOption());
  addToMap(new Tables());
  addToMap(new Parameter());
  addToMap(new FieldSymbol());
}

// -----------------------------------

export class SyntaxLogic {
  private currentFile: ABAPFile;
  private issues: Issue[];

  private readonly object: ABAPObject;
  private readonly reg: IRegistry;

  private readonly scope: CurrentScope;

  private readonly helpers: {
    oooc: ObjectOriented,
    proc: Procedural,
  };

  public constructor(reg: IRegistry, object: ABAPObject) {
    this.reg = reg;
    this.issues = [];

    this.object = object;
    this.scope = CurrentScope.buildDefault(this.reg, object);

    this.helpers = {
      oooc: new ObjectOriented(this.scope),
      proc: new Procedural(this.reg, this.scope),
    };
  }

  public run(): ISyntaxResult {
    if (this.object.syntaxResult !== undefined) {
      return this.object.syntaxResult;
    }

    this.issues = [];
    this.reg.getDDICReferences().clear(this.object);

    if (this.object instanceof Program && this.object.isInclude()) {
// todo, show some kind of error?
      return {issues: [], spaghetti: this.scope.pop(new Position(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER))};
    }

    this.traverseObject();

    for (;;) {
      const spaghetti = this.scope.pop(new Position(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)); // pop built-in scopes
      if (spaghetti.getTop().getIdentifier().stype === ScopeType.BuiltIn) {
        const result: ISyntaxResult = {issues: this.issues, spaghetti};
        this.object.syntaxResult = result;
        return result;
      }
    }

  }

/////////////////////////////

  private traverseObject(): CurrentScope {
    const traversal = this.object.getSequencedFiles();

    if (this.object instanceof Program
        || this.object instanceof FunctionGroup) {

      for (const f of this.object.getSequencedFiles()) {
        // add FORM defintions to the _global object scope
        this.helpers.proc.addAllFormDefinitions(f, this.object);
      }

      const main = this.object.getMainABAPFile();
      if (main !== undefined) {
        let stype = ScopeType.Program;
        if (this.object instanceof FunctionGroup) {
          stype = ScopeType.FunctionGroup;
        }
        this.scope.push(stype, this.object.getName(), new Position(1, 1), main.getFilename());
      }
    } else if (this.object instanceof TypePool) {
      const main = this.object.getMainABAPFile();
      if (main !== undefined) {
        this.scope.push(ScopeType.TypePool, this.object.getName(), new Position(1, 1), main.getFilename());
      }
    }

    for (const file of traversal) {
      this.currentFile = file;
      const structure = this.currentFile.getStructure();
      if (structure === undefined) {
        return this.scope;
      } else {
        this.traverse(structure);
      }
    }

    return this.scope;
  }

  private newIssue(token: Token, message: string): void {
    const issue = Issue.atToken(this.currentFile, token, message, "check_syntax", Severity.Error);
    this.issues.push(issue);
  }

  private traverse(node: StructureNode | StatementNode): void {
    for (const child of node.getChildren()) {
      const isStructure = child instanceof StructureNode;
      const isStatement = child instanceof StatementNode;

      try {
        if (isStructure) {
          const gotoNext = this.updateScopeStructure(child as StructureNode);
          if (gotoNext === true) {
            continue;
          }
        } else if (isStatement) {
          this.updateScopeStatement(child as StatementNode);
        }
      } catch (e) {
        this.newIssue(child.getFirstToken(), e.message);
        break;
      }

      // walk into INCLUDEs
      if (isStatement && child.get() instanceof Statements.Include) {
        const file = this.helpers.proc.findInclude(child as StatementNode, this.object);
        if (file !== undefined && file.getStructure() !== undefined) {
          const old = this.currentFile;
          this.currentFile = file;
          this.traverse(file.getStructure()!);
          this.currentFile = old;
        }
      }

      if (isStructure || isStatement) {
        this.traverse(child as StatementNode | StructureNode);
      }
    }
  }

  // if this returns true, then the traversal should continue with next child
  private updateScopeStructure(node: StructureNode): boolean {
    const filename = this.currentFile.getFilename();
    const stru = node.get();
    if (stru instanceof Structures.ClassDefinition) {
      new ClassDefinition(node, filename, this.scope);
      return true;
    } else if (stru instanceof Structures.Interface) {
      new InterfaceDefinition(node, filename, this.scope);
      return true;
    } else if (stru instanceof Structures.Types) {
      this.scope.addType(new Types().runSyntax(node, this.scope, filename));
      return true;
    } else if (stru instanceof Structures.Constants) {
      this.scope.addIdentifier(new Constants().runSyntax(node, this.scope, filename).type);
      return true;
    } else if (stru instanceof Structures.Data) {
      this.scope.addIdentifier(new DataStructure().runSyntax(node, this.scope, filename));
      return true;
    } else if (stru instanceof Structures.Statics) {
      this.scope.addIdentifier(new Statics().runSyntax(node, this.scope, filename));
      return true;
    } else if (stru instanceof Structures.TypeEnum) {
      const values = new TypeEnum().runSyntax(node, this.scope, filename).values;
      this.scope.addList(values);
      return true;
    }
    return false;
  }

  private updateScopeStatement(node: StatementNode): void {
    const filename = this.currentFile.getFilename();
    const s = node.get();

    // todo, refactor
    if (s instanceof Statements.Type) {
      this.scope.addType(new Type().runSyntax(node, this.scope, filename));
      return;
    } else if (s instanceof Statements.Constant) {
      this.scope.addIdentifier(new Constant().runSyntax(node, this.scope, filename));
      return;
    } else if (s instanceof Statements.Static) {
      this.scope.addIdentifier(new Static().runSyntax(node, this.scope, filename));
      return;
    } else if (s instanceof Statements.Data) {
      this.scope.addIdentifier(new DataStatement().runSyntax(node, this.scope, filename));
      return;
    }

    const name = s.constructor.name;
    if (map[name]) {
      map[name].runSyntax(node, this.scope, filename);
      return;
    }

    if (s instanceof Statements.FunctionModule) {
      this.helpers.proc.findFunctionScope(this.object, node, filename);

    } else if (s instanceof Statements.EndForm
        || s instanceof Statements.EndFunction
        || s instanceof Statements.EndClass
        || s instanceof Statements.EndInterface) {
      this.scope.pop(node.getLastToken().getEnd());
    } else if (s instanceof Statements.EndMethod) {
      this.scope.pop(node.getLastToken().getEnd());
      if (this.scope.getType() === ScopeType.MethodInstance) {
        this.scope.pop(node.getLastToken().getEnd());
      }
    }
  }

}