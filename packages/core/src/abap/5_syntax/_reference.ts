import {Identifier} from "../4_file_information/_identifier";

export enum ReferenceType {
  ClassReference = "ClassReference",
  InterfaceReference = "InterfaceReference",
  MethodReference = "MethodReference",
  FormReference = "FormReference",
  DataReadReference = "DataReadReference",
  DataWriteReference = "DataWriteReference",
}

export interface IReferenceExtras {
  className?: string,
}

export interface IReference {
  position: Identifier,
  resolved: Identifier,
  referenceType: ReferenceType,
  extra?: IReferenceExtras,
}