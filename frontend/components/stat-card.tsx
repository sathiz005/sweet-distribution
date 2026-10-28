export function StatCard({
  label,
  value,
  note,
  currency = true,
  due = false,
}: {
  label: string;
  value: number;
  note: string;
  currency?: boolean;
  due?: boolean;
}) {
  return (
    <article className={due ? "due" : ""}>
      <small>{label.toUpperCase()}</small>
      <strong>
        {currency && "₹"}
        {value.toLocaleString("en-IN")}
      </strong>
      <em>{note}</em>
    </article>
  );
}
