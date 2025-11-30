import { storeToRefs } from "pinia";
import { useExchangerStore } from "~/stores/exchanger";
import { useGetter } from "~/composables/useGetter";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return;
  const { activeTransaction } = storeToRefs(useExchangerStore());
  const { getByKey } = useGetter();
  const transaction = window.localStorage.getItem("transaction");
  if (transaction) {
    const parsedTransaction = JSON.parse(transaction);
    const itemFromDb = await getByKey("transactions", parsedTransaction.key);
    if (!itemFromDb) {
      window.localStorage.removeItem("transaction");
    } else if (itemFromDb.status === "payed") {
      activeTransaction.value = { ...itemFromDb, key: parsedTransaction.key };
    } else if (itemFromDb.status === "rejected") {
      window.localStorage.removeItem("transaction");
    } else {
      activeTransaction.value = { ...itemFromDb, key: parsedTransaction.key };
    }

    navigateTo(to.path);
  } else {
    navigateTo(to.path);
  }
});
