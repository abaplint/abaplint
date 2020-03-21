import {structureType} from "../_utils";
import {Interface} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "INTERFACE if_foo PUBLIC. ENDINTERFACE."},
  {abap: "INTERFACE if_foo PUBLIC. INTERFACES if_bar. ENDINTERFACE."},
  {abap: "INTERFACE if_foo PUBLIC. INTERFACES if_bar. ALIASES moo FOR if_bar~moo. ENDINTERFACE."},
];

structureType(cases, new Interface());