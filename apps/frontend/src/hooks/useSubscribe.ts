import { useRepContext } from "@/components/replicache-provider";
import { useDataStore, type DataStore } from "@/hooks/query-hooks";
import { useEffect } from "react";
import { unstable_batchedUpdates } from "react-dom";
import type { ReadTransaction } from "replicache";
// We wrap all the callbacks in a `unstable_batchedUpdates` call to ensure that
// we do not render things more than once over all of the changed subscriptions.
let hasPendingCallback = false;
let callbacks: Array<() => void> = [];
function doCallback() {
  const cbs = callbacks;
  callbacks = [];
  hasPendingCallback = false;
  unstable_batchedUpdates(() => {
    for (const callback of cbs) {
      callback();
    }
  });
}

export function useSubscribe<QueryRet, DataSelector>(
  query: (tx: ReadTransaction) => Promise<QueryRet>,
  dataSelector: (state: DataStore) => DataSelector,
  updatorSelector: (state: DataStore) => (data: any) => void,
  options?: { clearOnUnmount: boolean }
) {
  const r = useRepContext();
  const state = useDataStore(dataSelector);
  const updator = useDataStore(updatorSelector);

  useEffect(() => {
    if (!r) {
      return;
    }
    const unsubscribe = r.subscribe(query, {
      onData: (data) => {
        // This is safe because we know that subscribe in fact can only return
        // `R` (the return type of query or def).
        callbacks.push(() => updator(data));
        if (!hasPendingCallback) {
          void Promise.resolve().then(doCallback);
          hasPendingCallback = true;
        }
      },
    });
    return () => {
      unsubscribe();
      options?.clearOnUnmount && updator(undefined);
    };
  }, [r]);

  return state;
}
