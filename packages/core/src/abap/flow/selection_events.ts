import * as Statements from "../2_statements/statements";

export const SELECTION_EVENTS = [
  Statements.StartOfSelection,
  Statements.AtSelectionScreen,
  Statements.AtLineSelection,
  Statements.AtUserCommand,
  Statements.EndOfSelection,
  Statements.Initialization,
  Statements.TopOfPage,
  Statements.LoadOfProgram,
  Statements.EndOfPage,
];

export const DECLARATION_STUFF = [
  Statements.Data,
  Statements.DataBegin,
  Statements.Constant,
  Statements.Tables,
  Statements.Include, // this is not super correct, but anyhow
  Statements.Parameter,
  Statements.SelectionScreen,
  Statements.ConstantBegin,
];