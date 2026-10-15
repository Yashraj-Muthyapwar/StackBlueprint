/** The lesson's simplified hash table: ten numbered slots, location = student_id % 10. */
export const STUDENT_IDS = [101, 205, 309, 412, 518];
export const SLOT_COUNT = 10;
export const slotOf = (id: number) => id % SLOT_COUNT;

/** slots[i] holds the id stored at location i, or null when the slot is empty. */
export const SLOTS: (number | null)[] = Array.from({ length: SLOT_COUNT }, (_, slot) => {
  const found = STUDENT_IDS.find((id) => slotOf(id) === slot);
  return found ?? null;
});
