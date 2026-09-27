import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PLAN, findNight, nightHasKidsDay, normalizePlan, PEOPLE_MAX, PEOPLE_MIN, type NightId, type Plan } from "./plan";

const STORAGE_KEY = "notc.plan.v1";

function readStored(): Plan {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizePlan(JSON.parse(raw)) : DEFAULT_PLAN;
  } catch {
    return DEFAULT_PLAN;
  }
}

/** Plan state with validated updates and localStorage persistence. */
export function usePlan() {
  const [plan, setPlan] = useState<Plan>(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      /* private mode or blocked storage: the plan simply is not remembered */
    }
  }, [plan]);

  const setNight = useCallback(
    (nightId: NightId) => setPlan((p) => ({ ...p, nightId, kidsDay: p.kidsDay && nightHasKidsDay(findNight(nightId)) })),
    [],
  );
  const setPeople = useCallback(
    (people: number) =>
      setPlan((p) => {
        const next = Math.min(PEOPLE_MAX, Math.max(PEOPLE_MIN, Math.round(people) || PEOPLE_MIN));
        return { ...p, people: next, donors: Math.min(p.donors, next) };
      }),
    [],
  );
  const setDonors = useCallback(
    (donors: number) => setPlan((p) => ({ ...p, donors: Math.min(p.people, Math.max(0, Math.round(donors) || 0)) })),
    [],
  );
  const setKidsDay = useCallback(
    (kidsDay: boolean) => setPlan((p) => ({ ...p, kidsDay: kidsDay && nightHasKidsDay(findNight(p.nightId)) })),
    [],
  );
  const reset = useCallback(() => setPlan(DEFAULT_PLAN), []);

  return { plan, setNight, setPeople, setDonors, setKidsDay, reset };
}

export type PlanApi = ReturnType<typeof usePlan>;
