import {Alias} from "./alias";

export interface IAliases {
  getAll(): readonly Alias[];
}