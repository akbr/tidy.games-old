import { nanoid } from "nanoid";
export const getID = () => nanoid(10);

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export function createEntity<Type extends string, Data extends Object>(
  type: Type,
  data: Data
) {
  return {
    type,
    id: getID(),
    ...data,
  };
}

export function getById<T extends { id: string }>(arr: T[], id: string) {
  return arr.find((x) => x.id === id);
}

export function updateWith<T extends { id: string }>(arr: T[], entity: T) {
  return [...arr.filter((x) => x.id !== entity.id), entity];
}
