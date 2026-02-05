import { ReactNode, Suspense } from "react";

export function SuspensedItem<T>({
  item,
  fallback,
  result,
}: {
  item: Promise<T>;
  fallback: ReactNode;
  result: (item: T) => ReactNode;
}) {
    return (
  <Suspense fallback={fallback}>
    <Innercomponent item={item} result={result} />
  </Suspense>
    )
}

async function Innercomponent<T>({
  item,
  result,
}: {
  item: Promise<T>;
  result: (item: T) => ReactNode;
}) {
  return result(await item);
}
