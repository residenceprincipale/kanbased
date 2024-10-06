import { useRepContext } from "@/components/replicache-provider";
import { useDataStore } from "@/hooks/use-data-store";
import type { StoreKeys } from "@/hooks/use-data-store";
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

export function useSubscribe<QueryRet, TStoreKey extends StoreKeys>(
  query: (tx: ReadTransaction) => Promise<QueryRet>,
  storeKey: TStoreKey
) {
  const r = useRepContext();
  const state = useDataStore((state) => state[storeKey]);
  const updateStore = useDataStore((state) => state.updateStore);

  useEffect(() => {
    if (!r) {
      return;
    }
    const unsubscribe = r.subscribe(query, {
      onData: (data) => {
        // This is safe because we know that subscribe in fact can only return
        // `R` (the return type of query or def).
        // @ts-expect-error
        callbacks.push(() => updateStore(storeKey, () => data));
        if (!hasPendingCallback) {
          void Promise.resolve().then(doCallback);
          hasPendingCallback = true;
        }
      },
    });
    return () => {
      unsubscribe();
      updateStore(storeKey, () => undefined);
    };
  }, [r]);

  return state;
}
