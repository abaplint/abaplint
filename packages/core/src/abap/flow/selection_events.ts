import * as Statements from "../2_statements/statements";

export const SELECTION_EVENTS = [
  Statements.StartOfSelection,
  Statements.AtSelectionScreen,
  Statements.AtLineSelection,
  Statements.AtUserCommand,
  Statements.EndOfSelection,
  Statements.Initialization,
  Statements.TopOfPage,
  Statements.EndOfPage,
];

export const DECLARATION_STUFF = [
  Statements.Data,
  Statements.DataBegin,
  Statements.Constant,
  Statements.Parameter,
  Statements.SelectionScreen,
  Statements.ConstantBegin,
];