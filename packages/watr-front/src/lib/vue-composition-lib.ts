
import {
  ref as deepRef,
  Ref,
} from '@nuxtjs/composition-api';

export function divRef(div?: HTMLDivElement): Ref<HTMLDivElement | null> {
  const d = div || null;
  return deepRef(d);
}

