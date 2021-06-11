
import {
  ref,
  Ref
} from '@nuxtjs/composition-api'

export function divRef(div?: HTMLDivElement): Ref<HTMLDivElement|null> {
  const d = div || null
  return ref(d)
}

