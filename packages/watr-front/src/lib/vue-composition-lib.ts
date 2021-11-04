import {
  ref as deepRef,
  Ref,
} from '@nuxtjs/composition-api';

export function divRef(div: HTMLDivElement | null = null): Ref<HTMLDivElement | null> {
  return deepRef(div);
}
