import { computed } from 'vue'
import { decimal, minLength, required } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import type { IModel } from '~/components/Exchanger/types'

export const useValidationByRules = (model: IModel) => {
  const {
    isStarsBuy,
    isUSDTBuy
  } = storeToRefs(useExchangerStore());

  const rules = computed(() => {
    const ruleOptions = {
      memo: {minLength: minLength(6), decimal },
      count: { required, decimal },
      telegram: { required,  minLength: minLength(3)  },
    }

    if (!isStarsBuy.value) {
      ruleOptions.address ={ minLength: minLength(11), required }
    }

    if (isUSDTBuy.value) {
      ruleOptions.net = { required }
    }

    return ruleOptions
  })

  const v$ = useVuelidate(
    rules,
    model,
  )

  return {v$}
}