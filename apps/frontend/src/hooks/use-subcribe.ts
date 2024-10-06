import { useRepContext } from "@/components/replicache-provider";
import { useDataStore } from "@/hooks/use-data-store";
import type { StoreKeys } from "@/hooks/use-data-store";
import { useCallback, useSyncExternalStore } from "react";
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

const arr: any[] = [];
export function useSubscribe<QueryRet, TStoreKey extends StoreKeys>(
  query: (tx: ReadTransaction) => Promise<QueryRet>,
  storeKey: TStoreKey,
  deps: any[] = arr
) {
  const r = useRepContext();
  const updateStore = useDataStore((state) => state.updateStore);

  const subscribe = useCallback(() => {
    const unSubscribe = r.subscribe(query, {
      onData: (data) => {
        // @ts-expect-error
        callbacks.push(() => updateStore(storeKey, () => data));
        if (!hasPendingCallback) {
          void Promise.resolve().then(doCallback);
          hasPendingCallback = true;
        }
      },
    });

    return () => {
      unSubscribe();
      updateStore(storeKey, () => undefined);
    };
  }, deps);

  // Using this hook so we can subscribe immediately
  // instead of waiting for `useEffect` run on mount.
  useSyncExternalStore(subscribe, () => undefined);
}
