type DecimalInputProps = {
  value: string;
  placeholder?: string;
  onChangeCallback: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function DecimalInput({
  value,
  placeholder,
  onChangeCallback,
}: DecimalInputProps) {
  return (
    <input
      type="text"
      inputMode="decimal"
      pattern="\d*"
      placeholder={placeholder ?? ""}
      value={value}
      onChange={onChangeCallback}
      style={{
        fontSize: "1rem",
      }}
    />
  );
}
