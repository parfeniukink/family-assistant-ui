type DecimalInputProps = {
  value: string;
  placeholder?: string;
  onChangeCallback: (e: any) => void;
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
        fontSize: "16px",
      }}
    />
  );
}
