import type { Ref } from "react";

export function mergeRefs<TElement>(...refs: Array<Ref<TElement> | undefined>) {
  return (value: TElement | null) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === "function") {
        ref(value);
        return;
      }

      ref.current = value;
    });
  };
}
