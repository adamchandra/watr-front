
import {
  ref,
  Ref
} from '@vue/composition-api'

export function divRef(div?: HTMLDivElement): Ref<HTMLDivElement|null> {
  const d = div || null
  return ref(d)
}
