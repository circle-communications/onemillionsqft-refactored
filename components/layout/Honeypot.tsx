/**
 * Hidden spam trap. Real visitors never see or fill it; bots (and form-filler extensions) that fill
 * every field give themselves away. The server discards any submission whose `hp` field is
 * non-empty (lib/leads/handler.ts) and logs it.
 *
 * The field is deliberately NOT named or labelled like a real field ("website", "url"): browsers
 * and password managers autofill those, which would make a genuine visitor look like a bot.
 *
 * Each form keeps the value in state and sends it with the rest of the payload:
 *   const [trap, setTrap] = useState('');  ...  <Honeypot value={trap} onChange={setTrap} />
 *   submitLead(kind, { ...fields, hp: trap })
 */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
      <input
        type="text"
        name="hp"
        tabIndex={-1}
        autoComplete="off"
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
