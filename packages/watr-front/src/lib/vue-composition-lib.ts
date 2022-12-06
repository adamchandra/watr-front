import {
  ref as deepRef,
  Ref,
} from 'vue';

export function divRef(div: HTMLDivElement | null = null): Ref<HTMLDivElement | null> {
  return deepRef(div);
}
